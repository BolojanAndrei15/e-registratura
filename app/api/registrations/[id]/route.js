import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { registration } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate required fields
    if (!data.registrationNo || !data.sentDate) {
      return NextResponse.json(
        { error: "Numărul de înregistrare și data expedierii sunt obligatorii" },
        { status: 400 }
      );
    }

    // Update the registration
    const updatedRegistration = await db
      .update(registration)
      .set({
        registrationNo: data.registrationNo,
        documentNo: data.documentNo || null,
        handlerId: data.handlerId || null,
        documentDate: data.documentDate ? new Date(data.documentDate) : null,
        sentDate: new Date(data.sentDate),
        source: data.source || null,
        statusId: data.statusId || null,
        documentTypeId: data.documentTypeId || null,
        summary: data.summary || null,
        updatedAt: new Date()
      })
      .where(eq(registration.id, id))
      .returning();

    if (updatedRegistration.length === 0) {
      return NextResponse.json(
        { error: "Înregistrarea nu a fost găsită" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRegistration[0]
    });

  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea înregistrării" },
      { status: 500 }
    );
  }
}
