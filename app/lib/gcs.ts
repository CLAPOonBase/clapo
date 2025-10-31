import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage with better error handling
let storage: Storage;
let bucket: any;

try {
  // Parse the private key more carefully
  const privateKey = process.env.GCS_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('GCS_PRIVATE_KEY is not set');
  }

  // Replace literal \n with actual newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  console.log('🔑 Initializing GCS with credentials...');
  console.log('Project ID:', process.env.GCS_PROJECT_ID);
  console.log('Client Email:', process.env.GCS_CLIENT_EMAIL);
  console.log('Bucket:', process.env.GCS_BUCKET_NAME);
  console.log('Private key starts with:', formattedKey.substring(0, 30));

  storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL,
      private_key: formattedKey,
    },
  });

  const bucketName = process.env.GCS_BUCKET_NAME || 'clapo_media_bucket';
  bucket = storage.bucket(bucketName);

  console.log('✅ GCS client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize GCS:', error);
  throw error;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  publicUrl: string;
  fileName: string;
}

export const uploadToGCS = async (
  file: File,
  userId: string,
  postId?: string
): Promise<UploadResult> => {
  const bucketName = process.env.GCS_BUCKET_NAME || 'clapo_media_bucket';
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

  console.log('📤 Uploading to GCS:', {
    fileName,
    bucket: bucketName,
    size: file.size,
    type: file.type,
  });

  try {
    // Convert File to Buffer for GCS
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📦 File converted to buffer, size:', buffer.length);

    const blob = bucket.file(fileName);

    // Upload the file with public read access directly
    // This avoids needing to call makePublic() separately
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
      predefinedAcl: 'publicRead', // Make file public during upload
    });

    console.log('✅ File uploaded to GCS');

    // Get the public URL
    const url = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    console.log('✅ Upload complete:', url);
    console.log('🔗 Public URL:', url);

    return {
      url,
      key: fileName,
    };
  } catch (error) {
    console.error('❌ GCS upload failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('does not have')) {
        throw new Error(`Permission denied: ${error.message}. Please check GCS bucket permissions.`);
      } else if (error.message.includes('not found')) {
        throw new Error(`Bucket '${bucketName}' not found. Please verify the bucket name.`);
      }
    }

    throw new Error(`Failed to upload file to Google Cloud Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateSignedUploadUrl = async (
  userId: string,
  fileType: string,
  fileExtension: string
): Promise<SignedUrlResult> => {
  const bucketName = process.env.GCS_BUCKET_NAME || 'clapo_media_bucket';
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

  console.log('🔐 Generating signed URL for:', {
    fileName,
    bucket: bucketName,
    contentType: fileType,
  });

  try {
    const file = bucket.file(fileName);

    // Generate a signed URL for upload that expires in 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: fileType,
      extensionHeaders: {
        'x-goog-acl': 'public-read', // Make the file public after upload
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    console.log('✅ Signed URL generated successfully');

    return {
      signedUrl,
      publicUrl,
      fileName,
    };
  } catch (error) {
    console.error('❌ Failed to generate signed URL:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    throw new Error(`Failed to generate signed upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
