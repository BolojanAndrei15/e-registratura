import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const fileType = formData.get("fileType");
  const fileTitle = formData.get("fileTitle");
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Prepare file for n8n webhook
  const n8nForm = new FormData();
  n8nForm.append("file", file, file.name);
  if (fileType) n8nForm.append("fileType", fileType);
  if (fileTitle) n8nForm.append("fileTitle", fileTitle);

  const n8nRes = await fetch("http://localhost:5678/webhook-test/document-recognition", {
    method: "POST",
    body: n8nForm,
  });

  // Read JSON response from n8n
  let n8nData = null;
  try {
    n8nData = await n8nRes.json();
  } catch (e) {
    return NextResponse.json({ error: "n8n webhook did not return valid JSON" }, { status: 500 });
  }

  return NextResponse.json({ success: true, n8n: n8nData });
}
