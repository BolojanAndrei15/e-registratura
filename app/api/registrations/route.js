import { db } from '@/lib/drizzle.js';
import { registration, register } from '@/lib/schema.js';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getNextRegistrationNumber } from '@/lib/schema.js';

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
        fileName = file.name;        fileType = file.type;
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
    } = body || {};

    // Verifică că body există și nu este null
    if (!body) {
      return NextResponse.json({ error: 'Body request invalid' }, { status: 400 });
    }

    // Verifică că registerId există
    if (!registerId) {
      return NextResponse.json({ error: 'registerId este obligatoriu' }, { status: 400 });
    }

    // Obține următorul număr de înregistrare
    let registrationNo;
    try {
      registrationNo = await getNextRegistrationNumber(registerId);
    } catch (error) {
      console.error('Error getting next registration number:', error);
      return NextResponse.json({ error: 'Eroare la obținerea numărului de înregistrare' }, { status: 500 });
    }

    // Insert registration as before
    const [created] = await db.insert(registration).values({
      registerId,
      registrationNo,
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

    // Get fileStorageId from Register
    let fileStorageId = null;
    if (registerId) {
      const regArr = await db.select({ registerStorageId: register.registerStorageId }).from(register).where(eq(register.id, registerId));
        if (regArr && regArr.length > 0) fileStorageId = regArr[0].registerStorageId;
    }

    // Send registration info and document (if present) to n8n registration webhook using multipart/form-data
    try {
      // Verifică dacă avem URL-ul n8n configurat
      if (!process.env.N8N_URL) {
        console.warn('N8N_URL not configured, skipping webhook');
      } else {
        const FormData = require('form-data');
        const axios = require('axios');
        
        const n8nForm = new FormData();
          // Adaugă datele de bază (verifică că nu sunt null/undefined)
        n8nForm.append('documentName', (fileName || '').toString());
        n8nForm.append('registrationNo', (created.registrationNo || '').toString());
        n8nForm.append('registrationId', (created.id || '').toString());
        n8nForm.append('action', 'create');
        n8nForm.append('registryId', (created.registerId || '').toString());
        n8nForm.append('fileStorageId', (fileStorageId || '').toString());
        
        // Adaugă fișierul doar dacă există
        if (fileBuffer && fileName) {
          n8nForm.append('file', fileBuffer, { 
            filename: fileName, 
            contentType: fileType || 'application/octet-stream' 
          });
        }
        
        // Obține headers și verifică că sunt valide
        const headers = n8nForm.getHeaders();
        if (headers && typeof headers === 'object') {
          await axios.post(`${process.env.N8N_URL}/webhook-test/registration`, n8nForm, {
            headers,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 10000 // 10 secunde timeout
          });
          console.log('Successfully sent webhook to n8n');
        } else {
          console.error('Invalid headers from FormData');
        }
      }
    } catch (err) {
      // Log eroarea dar nu bloca crearea înregistrării
      console.error('n8n registration webhook error:', {
        message: err?.message || 'Unknown error',
        code: err?.code,
        status: err?.response?.status
      });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/registrations error:', error);
    return NextResponse.json({ error: 'Eroare la crearea înregistrării.' }, { status: 500 });
  }
}