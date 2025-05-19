import { db } from '@/lib/drizzle.js';
import { registration } from '@/lib/schema.js';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const registerId = searchParams.get('registerId');
  if (!registerId) {
    return NextResponse.json({ error: 'registerId lipsă în query.' }, { status: 400 });
  }
  try {
    // Select all fields, including registrantId
    const regs = await db.select().from(registration).where(eq(registration.registerId, registerId));
    return NextResponse.json(regs);
  } catch (error) {
    return NextResponse.json({ error: 'Eroare la preluarea înregistrărilor.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Accept multipart/form-data for file upload
    const contentType = req.headers.get('content-type') || '';
    let body, fileBuffer, fileName, fileType;
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = JSON.parse(formData.get('json'));
      const file = formData.get('file');
      if (file) {
        fileBuffer = Buffer.from(await file.arrayBuffer());
        fileName = file.name;
        fileType = file.type;
      }
    } else {
      body = await req.json();
    }
    // Extract fields as before
    const {
      registerId,
      departmentId,
      documentNo,
      registrantId,
      handlerId,
      documentDate,
      sentDate,
      source,
      statusId,
      documentTypeId,
      summary
    } = body;

    // Insert registration as before
    const [created] = await db.insert(registration).values({
      registerId,
      departmentId,
      documentNo,
      registrantId,
      handlerId,
      documentDate: documentDate ? new Date(documentDate).toISOString() : null,
      sentDate: sentDate ? new Date(sentDate).toISOString() : null,
      source,
      statusId,
      documentTypeId,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    // If file was uploaded, do not send to document-upload webhook anymore

    // Send registration info and document (if present) to n8n registration webhook using multipart/form-data
    try {
      const FormData = require('form-data');
      const axios = require('axios');
      const n8nForm = new FormData();
      n8nForm.append('documentName', fileName || '');
      n8nForm.append('registrationNo', created.documentNo?.toString() || '');
      n8nForm.append('action', 'create');
      n8nForm.append('registryId', created.registerId?.toString() || '');
      if (fileBuffer && fileName) {
        n8nForm.append('file', fileBuffer, { filename: fileName, contentType: fileType || 'application/octet-stream' });
      }
      await axios.post('http://localhost:5678/webhook-test/registration', n8nForm, {
        headers: n8nForm.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
    } catch (err) {
      console.error('n8n registration webhook error:', err);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Eroare la crearea înregistrării.' }, { status: 500 });
  }
}