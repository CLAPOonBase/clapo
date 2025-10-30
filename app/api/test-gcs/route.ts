import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing GCS configuration...');

    // Check if env vars are set
    const hasProjectId = !!process.env.GCS_PROJECT_ID;
    const hasBucketName = !!process.env.GCS_BUCKET_NAME;
    const hasClientEmail = !!process.env.GCS_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.GCS_PRIVATE_KEY;

    console.log('Environment variables:', {
      hasProjectId,
      hasBucketName,
      hasClientEmail,
      hasPrivateKey,
      projectId: process.env.GCS_PROJECT_ID,
      bucketName: process.env.GCS_BUCKET_NAME,
      clientEmail: process.env.GCS_CLIENT_EMAIL,
    });

    if (!hasProjectId || !hasBucketName || !hasClientEmail || !hasPrivateKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing GCS environment variables',
        details: {
          hasProjectId,
          hasBucketName,
          hasClientEmail,
          hasPrivateKey,
        },
      }, { status: 500 });
    }

    // Try to initialize Storage
    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });

    console.log('✅ Storage client created');

    const bucketName = process.env.GCS_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);

    // Try to check if bucket exists
    const [exists] = await bucket.exists();
    console.log(`Bucket ${bucketName} exists:`, exists);

    if (!exists) {
      return NextResponse.json({
        success: false,
        error: 'Bucket does not exist',
        bucketName,
      }, { status: 404 });
    }

    // Try to get bucket metadata
    const [metadata] = await bucket.getMetadata();
    console.log('Bucket metadata:', metadata);

    // Try to create a test file
    const testFileName = `test-${Date.now()}.txt`;
    const testFile = bucket.file(testFileName);

    await testFile.save('Hello from GCS test!', {
      metadata: {
        contentType: 'text/plain',
      },
      public: true,
    });

    console.log('✅ Test file created:', testFileName);

    const testUrl = `https://storage.googleapis.com/${bucketName}/${testFileName}`;

    // Clean up test file
    await testFile.delete();
    console.log('✅ Test file deleted');

    return NextResponse.json({
      success: true,
      message: 'GCS configuration is working correctly',
      bucketName,
      testFileCreated: true,
      testUrl,
    });

  } catch (error) {
    console.error('❌ GCS test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'GCS test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
