import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configuring CORS for GCS bucket...');

    // Check if GCS is configured
    if (!process.env.GCS_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GCS_CLIENT_EMAIL || !process.env.GCS_PRIVATE_KEY) {
      console.error('❌ Missing GCS environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing GCS credentials' },
        { status: 500 }
      );
    }

    const privateKey = process.env.GCS_PRIVATE_KEY;
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: formattedKey,
      },
    });

    const bucketName = process.env.GCS_BUCKET_NAME || 'clapo_media_bucket';
    const bucket = storage.bucket(bucketName);

    // Configure CORS
    const corsConfiguration = [
      {
        origin: ['https://clapo.vercel.app', 'https://*.vercel.app', 'http://localhost:3000'],
        method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        responseHeader: ['Content-Type', 'x-goog-acl', 'x-goog-content-length-range'],
        maxAgeSeconds: 3600,
      },
    ];

    await bucket.setCorsConfiguration(corsConfiguration);

    console.log('✅ CORS configuration applied successfully');

    return NextResponse.json({
      success: true,
      message: 'CORS configuration applied successfully',
      config: corsConfiguration,
    });
  } catch (error) {
    console.error('❌ CORS configuration error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to configure CORS',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
