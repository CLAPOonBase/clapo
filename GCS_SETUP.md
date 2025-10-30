# Google Cloud Storage Setup for Media Uploads

## Issue
Photos and videos are not uploading to Google Cloud Storage.

## Required GCS Configuration

### 1. Make Bucket Publicly Accessible

Your GCS bucket `clapo_media_bucket` needs to be configured to allow public access:

#### Option A: Using Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/storage/browser)
2. Find your bucket: `clapo_media_bucket`
3. Click on the bucket name
4. Go to the **Permissions** tab
5. Click **+ Grant Access**
6. Add these permissions:
   - **Principal**: `allUsers`
   - **Role**: `Storage Object Viewer`
7. Click **Save**

#### Option B: Using gsutil command

```bash
gsutil iam ch allUsers:objectViewer gs://clapo_media_bucket
```

### 2. Verify Service Account Permissions

Make sure your service account has the correct permissions:

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find: `serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com`
3. Ensure it has these roles:
   - **Storage Admin** or
   - **Storage Object Admin**

### 3. Configure CORS (Optional but Recommended)

If uploads are blocked by CORS, configure it:

```bash
# Create cors.json file
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS configuration
gsutil cors set cors.json gs://clapo_media_bucket
```

### 4. Environment Variables

Verify your `.env` file has these set:

```env
GCS_PROJECT_ID=seraphic-heaven-476106-p6
GCS_BUCKET_NAME=clapo_media_bucket
GCS_CLIENT_EMAIL=serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Testing Upload

### Test from Terminal

```bash
# Test if server can reach GCS
curl http://localhost:3000/api/test-gcs
```

### Test from Browser

1. Start dev server: `npm run dev`
2. Try uploading a photo or video
3. Check browser console (F12) for detailed error messages
4. Check server terminal for upload logs

## Common Issues

### Issue 1: "Access Denied"
**Solution**: Make sure service account has Storage Object Admin role

### Issue 2: "Bucket not found"
**Solution**: Verify bucket name is correct and exists in your GCP project

### Issue 3: Files upload but return 403 when accessed
**Solution**: Make bucket public using Option A or B above

### Issue 4: "CORS policy" errors
**Solution**: Configure CORS using the command above

## Verify It's Working

After configuration, uploaded files should be accessible at:
```
https://storage.googleapis.com/clapo_media_bucket/{userId}/{timestamp}-{random}.{extension}
```

## Need Help?

Check server logs for detailed error messages:
- Look for `📤 Uploading to GCS:`
- Look for `❌ GCS upload failed:`
- Check the error details in the logs
