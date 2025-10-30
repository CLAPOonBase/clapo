# Fix GCS Upload Permissions - URGENT

## Problem Identified
Your service account `serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com` **does not have permission** to access the GCS bucket `clapo_media_bucket`.

## Solution: Grant Permissions to Service Account

### Option 1: Using Google Cloud Console (Recommended - 2 minutes)

#### Step 1: Grant Bucket Permissions
1. Go to: https://console.cloud.google.com/storage/browser
2. Click on `clapo_media_bucket`
3. Click the **Permissions** tab at the top
4. Click **+ Grant Access** button
5. Fill in:
   - **Add principals**: `serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com`
   - **Select a role**: Search for and select **Storage Object Admin**
6. Click **Save**

#### Step 2: Make Bucket Publicly Readable (for viewing uploaded files)
1. Still in the **Permissions** tab
2. Click **+ Grant Access** again
3. Fill in:
   - **Add principals**: `allUsers`
   - **Select a role**: **Storage Object Viewer**
4. Click **Save**
5. Confirm the warning about making it public

### Option 2: Using gcloud CLI (Fast - 30 seconds)

Run these commands in your terminal:

```bash
# Grant service account permissions to upload/manage objects
gcloud projects add-iam-policy-binding seraphic-heaven-476106-p6 \
  --member="serviceAccount:serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://clapo_media_bucket
```

### Option 3: Quick Fix - Simpler Bucket-Level Permission

```bash
# Give service account full access to the bucket
gsutil iam ch serviceAccount:serviceobjectadmin@seraphic-heaven-476106-p6.iam.gserviceaccount.com:roles/storage.objectAdmin gs://clapo_media_bucket

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://clapo_media_bucket
```

## Verify the Fix

After applying permissions, test the upload:

1. **Restart your dev server:**
   ```bash
   cd clapo
   npm run dev
   ```

2. **Test the GCS connection:**
   - Open: http://localhost:3000/api/test-gcs
   - You should see: `"success": true`

3. **Try uploading an image:**
   - Create a post with an image
   - Check browser console (F12) for errors
   - Check server terminal for upload logs

## Expected Success Messages

When it works, you'll see:
- ✅ `"success": true` in test-gcs
- ✅ `📤 Upload request received` in server logs
- ✅ `✅ Upload complete: https://storage.googleapis.com/clapo_media_bucket/...`
- ✅ Image appears in post preview

## Still Not Working?

If after following these steps it still doesn't work:

1. **Check if bucket exists:**
   ```bash
   gsutil ls | grep clapo_media_bucket
   ```

2. **Verify service account:**
   ```bash
   gcloud iam service-accounts list | grep serviceobjectadmin
   ```

3. **Share these with me:**
   - Output of: `curl http://localhost:3000/api/test-gcs`
   - Browser console errors (F12 → Console)
   - Server terminal logs when uploading

## What These Permissions Do

- **Storage Object Admin** (for service account): Allows your app to upload, read, and delete files
- **Storage Object Viewer** (for allUsers): Allows anyone to view/download uploaded files (needed for images to display in posts)

## Important Notes

⚠️ Making the bucket public (`allUsers:objectViewer`) allows anyone to view uploaded files. This is necessary for images/videos to display in your app.

✅ The service account can only upload files, not make them public individually, so bucket-level public access is required.
