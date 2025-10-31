import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadUrl } from '@/app/lib/gcs';

// Configure route for quick response
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Signed URL request received');

    // Check if GCS is configured
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
      console.error('❌ Missing GCS environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing GCS credentials' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, fileType, fileExtension } = body;

    if (!userId || !fileType || !fileExtension) {
      console.error('❌ Missing required parameters:', { userId, fileType, fileExtension });
      return NextResponse.json(
        { error: 'Missing required parameters: userId, fileType, fileExtension' },
        { status: 400 }
      );
    }

    console.log('📄 Generating signed URL for:', {
      userId,
      fileType,
      fileExtension,
    });

    // Generate signed URL for direct upload to GCS
    const result = await generateSignedUploadUrl(userId, fileType, fileExtension);

    console.log('✅ Signed URL generated successfully');

    return NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      publicUrl: result.publicUrl,
      fileName: result.fileName,
    });
  } catch (error) {
    console.error('❌ Signed URL generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to generate signed URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
