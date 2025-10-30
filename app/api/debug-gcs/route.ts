import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const hasProjectId = !!process.env.GCS_PROJECT_ID;
    const hasBucketName = !!process.env.GCS_BUCKET_NAME;
    const hasClientEmail = !!process.env.GCS_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.GCS_PRIVATE_KEY;

    const privateKeyPreview = process.env.GCS_PRIVATE_KEY
      ? process.env.GCS_PRIVATE_KEY.substring(0, 50) + '...'
      : 'Not set';

    return NextResponse.json({
      credentials: {
        hasProjectId,
        hasBucketName,
        hasClientEmail,
        hasPrivateKey,
        projectId: process.env.GCS_PROJECT_ID || 'NOT SET',
        bucketName: process.env.GCS_BUCKET_NAME || 'NOT SET',
        clientEmail: process.env.GCS_CLIENT_EMAIL || 'NOT SET',
        privateKeyPreview,
        privateKeyStartsWith: process.env.GCS_PRIVATE_KEY?.substring(0, 30) || 'NOT SET',
      },
      suggestions: [
        'Verify bucket name is correct',
        'Verify bucket exists in project: ' + (process.env.GCS_PROJECT_ID || 'NOT SET'),
        'Check if private key has correct format (should start with -----BEGIN PRIVATE KEY-----)',
        'Verify service account email matches the one in GCS permissions',
      ]
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
