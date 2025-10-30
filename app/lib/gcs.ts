import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || 'clapo_media_bucket';
const bucket = storage.bucket(bucketName);

export interface UploadResult {
  url: string;
  key: string;
}

export const uploadToGCS = async (
  file: File,
  userId: string,
  postId?: string
): Promise<UploadResult> => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

  // Convert File to Buffer for GCS
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = bucket.file(fileName);

  try {
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      public: true, // Make the file publicly accessible
    });

    // Get the public URL
    const url = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return {
      url,
      key: fileName,
    };
  } catch (error) {
    console.error('GCS upload failed:', error);
    throw new Error('Failed to upload file to Google Cloud Storage');
  }
};

export const deleteFromGCS = async (key: string): Promise<void> => {
  try {
    await bucket.file(key).delete();
  } catch (error) {
    console.error('GCS delete failed:', error);
    throw new Error('Failed to delete file from Google Cloud Storage');
  }
};

export const getFileType = (file: File): 'image' | 'video' | 'audio' | 'other' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'other';
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mkv',
    'video/flv',
    'video/wmv',
    'video/m4v',
    'video/3gp',
    'video/ts',
    'video/mts',
    'video/m2ts',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/wma',
    'audio/opus',
    'audio/aiff',
    'audio/pcm',
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  return { isValid: true };
}
