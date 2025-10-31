import { NextRequest, NextResponse } from 'next/server';
import { uploadToGCS, validateFile } from '@/app/lib/gcs';

// Configure route for large file uploads
export const maxDuration = 60; // Maximum execution time in seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload request received');

    // Check if GCS is configured
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
      console.error('❌ Missing GCS environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing GCS credentials' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      console.error('❌ File validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    // Generate a user ID (you might want to get this from authentication)
    // For now, using a timestamp-based ID
    const userId = formData.get('userId') as string || 'default';

    console.log('🚀 Starting upload to GCS for user:', userId);

    // Upload to Google Cloud Storage
    const result = await uploadToGCS(file, userId);

    console.log('✅ Upload successful:', result.url);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
