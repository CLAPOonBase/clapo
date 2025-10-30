import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export interface UploadResult {
  url: string
  key: string
}

export const uploadToS3 = async (
  file: File,
  userId: string,
  postId?: string
): Promise<UploadResult> => {
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop()
  const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
  
  // Convert File to Buffer for S3
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const command = new PutObjectCommand({
    Bucket: 'snappostmedia',
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  })

  try {
    await s3Client.send(command)
    const url = `https://snappostmedia.s3.ap-southeast-1.amazonaws.com/${fileName}`
    
    return {
      url,
      key: fileName,
    }
  } catch (error) {
    console.error('S3 upload failed:', error)
    throw new Error('Failed to upload file to S3')
  }
}

export const deleteFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: 'snappostmedia',
    Key: key,
  })

  try {
    await s3Client.send(command)
  } catch (error) {
    console.error('S3 delete failed:', error)
    throw new Error('Failed to delete file from S3')
  }
}

export const getFileType = (file: File): 'image' | 'video' | 'audio' | 'other' => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'other'
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
  ]

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 50MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' }
  }

  return { isValid: true }
} 