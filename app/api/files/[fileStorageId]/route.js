import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request, { params }) {
  try {
    const { fileStorageId } = params
    
    if (!fileStorageId) {
      return NextResponse.json({ error: 'File storage ID is required' }, { status: 400 })
    }

    // Construct the file path - adjust this based on your file storage structure
    // This assumes files are stored in a 'uploads' folder in the public directory
    const filePath = path.join(process.cwd(), 'public', 'uploads', `${fileStorageId}.pdf`)
    
    try {
      // Check if file exists
      await fs.access(filePath)
      
      // Read the file
      const fileBuffer = await fs.readFile(filePath)
      
      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileStorageId}.pdf"`,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      })
    } catch (fileError) {
      console.error('File not found:', fileError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
