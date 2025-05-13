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

    // If file was uploaded, send to webhook
    if (fileBuffer && fileName) {
      // Compose metadata for n8n
      const n8nMeta = {
        registrationId: created.id,
        type: documentTypeId,
        summary,
        statusId,
        documentTypeId
      };
      // Send all required fields in the body as multipart/form-data
      const n8nForm = new FormData();
      n8nForm.append('file', new Blob([fileBuffer], { type: fileType || 'application/octet-stream' }), fileName);
      n8nForm.append('registrationId', created.id?.toString() || '');
      n8nForm.append('type', documentTypeId);
      n8nForm.append('summary', summary);
      n8nForm.append('statusId', statusId);
      n8nForm.append('documentTypeId', documentTypeId);
      await fetch('http://localhost:5678/webhook-test/document-upload', {
        method: 'POST',
        body: n8nForm,
      });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Eroare la crearea înregistrării.' }, { status: 500 });
  }
}