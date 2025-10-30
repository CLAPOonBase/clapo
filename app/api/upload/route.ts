import { NextRequest, NextResponse } from 'next/server';
import { uploadToGCS, validateFile } from '@/app/lib/gcs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    // Generate a user ID (you might want to get this from authentication)
    // For now, using a timestamp-based ID
    const userId = formData.get('userId') as string || 'default';

    // Upload to Google Cloud Storage
    const result = await uploadToGCS(file, userId);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
