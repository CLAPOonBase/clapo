import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing S3 upload with minimal file...')
    
    // Create a minimal test file
    const testContent = 'Hello World'
    const testFileName = `test-${Date.now()}.txt`
    
    const command = new PutObjectCommand({
      Bucket: 'snappostmedia',
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
    })

    console.log('📁 Sending test file to S3...')
    await s3Client.send(command)
    console.log('✅ Test upload successful')
    
    // Try to read it back
    const url = `https://snappostmedia.s3.ap-southeast-1.amazonaws.com/${testFileName}`
    
    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      fileName: testFileName,
      url: url
    })
    
  } catch (error) {
    console.error('❌ Test upload failed:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorType: error.constructor.name
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown error occurred'
    }, { status: 500 })
  }
}
