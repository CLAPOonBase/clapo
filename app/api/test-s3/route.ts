import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing S3 connection...')
    
    // Test basic S3 connectivity
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)
    
    console.log('✅ S3 connection successful')
    console.log('📦 Available buckets:', response.Buckets?.map(b => b.Name))
    
    return NextResponse.json({
      success: true,
      message: 'S3 connection successful',
      buckets: response.Buckets?.map(b => b.Name) || [],
    })
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'S3 connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
