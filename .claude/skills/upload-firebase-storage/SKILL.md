---
name: bill-organizer:upload-firebase-storage
description: Handles the multer→Firebase Storage upload step in isolation. Use for testing Firebase connectivity, upload config, and public URL generation independently of the OCR/AI pipeline.
---

# Upload Image to Firebase Storage

Handles the image upload step independently — multer config, Firebase Storage save, and public URL generation. Use this to verify Firebase connectivity before running the full pipeline.

## When to Use

- Initial Firebase setup verification
- Testing bucket permissions and CORS config
- Debugging upload failures (file not appearing, wrong URL, permission errors)
- Isolating upload issues from OCR/AI issues in the pipeline
- Testing different file types, sizes, and content types

## Prerequisites

- `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_STORAGE_BUCKET` in `server/.env`
- `firebase-admin` installed: `npm install firebase-admin`
- `multer` installed: `npm install multer`
- Firebase project with Storage enabled and service account with `roles/storage.admin`

## Firebase Console Setup Check (before coding)

1. Go to Firebase Console → Storage → Rules
2. Ensure the bucket allows uploads from your service account:
   ```
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;  // for development
       }
     }
   }
   ```
3. Go to Project Settings → Service Accounts → Generate new private key
4. Copy the JSON content into `FIREBASE_SERVICE_ACCOUNT` env var (single line)

## Configuration

### Multer Middleware (`server/src/middleware/upload.js`)

```javascript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, BMP, TIFF`));
    }
  },
});

export default upload;
```

### Firebase Upload Function (`server/src/utils/firebaseStorage.js`)

```javascript
import { getStorage, getDownloadURL } from 'firebase-admin/storage';

/**
 * Upload a file buffer to Firebase Storage and return the public URL.
 * @param {Buffer} buffer - The file buffer (from multer req.file.buffer)
 * @param {string} originalname - Original filename (used for extension)
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} Public download URL
 */
export async function uploadToFirebase(buffer, originalname, mimetype) {
  const bucket = getStorage().bucket();

  // Generate unique filename to prevent collisions
  const timestamp = Date.now();
  const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = `bills/${timestamp}_${safeName}`;

  const file = bucket.file(destination);

  await file.save(buffer, {
    contentType: mimetype,
    metadata: {
      metadata: {
        originalName: originalname,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Option A: Make public (simplest for development)
  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

  // Option B: Firebase download URL (with auto-generated access token)
  // const publicUrl = await getDownloadURL(file);
  // Note: getDownloadURL() only works if the file has downloadTokens metadata.
  // If it throws "No download token", use Option A.

  return publicUrl;
}

/**
 * Delete a file from Firebase Storage by its public URL.
 * @param {string} publicUrl - The full public URL of the file
 */
export async function deleteFromFirebase(publicUrl) {
  const bucket = getStorage().bucket();

  // Extract path from URL: https://storage.googleapis.com/BUCKET_NAME/path/to/file
  const url = new URL(publicUrl);
  const path = url.pathname.substring(1); // remove leading /
  const pathParts = path.split('/');
  const bucketName = pathParts[0];
  const filePath = pathParts.slice(1).join('/');

  if (bucketName !== bucket.name) {
    console.warn(`URL bucket "${bucketName}" doesn't match configured bucket "${bucket.name}"`);
  }

  await bucket.file(filePath).delete();
}
```

### Route (`server/src/routes/upload.js`)

```javascript
import { Router } from 'express';
import upload from '../middleware/upload.js';
import { uploadToFirebase, deleteFromFirebase } from '../utils/firebaseStorage.js';

const router = Router();

// POST /api/upload — upload a single image
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Use form field name "image".' });
    }

    const url = await uploadToFirebase(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json({
      message: 'File uploaded successfully',
      imageUrl: url,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
```

### Mount in app.js
```javascript
import uploadRoutes from './routes/upload.js';
app.use('/api/upload', uploadRoutes);
```

## Testing

### Test 1: cURL upload
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/test-bill.jpg"
```
Expected response:
```json
{
  "message": "File uploaded successfully",
  "imageUrl": "https://storage.googleapis.com/your-project.appspot.com/bills/1234567890_test-bill.jpg",
  "originalName": "test-bill.jpg",
  "size": 123456
}
```

### Test 2: Verify URL is publicly accessible
```bash
curl -I <imageUrl>
# Should return HTTP/2 200 with content-type: image/jpeg
```

### Test 3: Node.js smoke test (no server needed)
```javascript
// server/src/utils/testFirebase.js
import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = getStorage().bucket();
const buffer = readFileSync('./test-image.jpg');
const file = bucket.file('test/smoke-test.jpg');

await file.save(buffer, { contentType: 'image/jpeg' });
await file.makePublic();

const url = `https://storage.googleapis.com/${bucket.name}/test/smoke-test.jpg`;
console.log('✓ Uploaded to:', url);

// Cleanup
await file.delete();
```
```bash
cd server && node src/utils/testFirebase.js
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `req.file is undefined` | Form field name mismatch | Use `-F "image=@file.jpg"` (field name must match `upload.single('image')`) |
| `Cannot read properties of undefined (reading 'bucket')` | Firebase not initialized | Check `initializeApp()` runs before `getStorage()` |
| `400 Bad Request: Invalid bucket name` | `storageBucket` has `gs://` prefix | Remove prefix — use `project-id.appspot.com` |
| `403 Forbidden` on uploaded file URL | File not made public | Call `await file.makePublic()` after save |
| `EACCES: permission denied` | Service account missing Storage permissions | Add `roles/storage.admin` role in GCP IAM |
| `Error: Not a valid base64 string` | Private key newlines escaped wrong | Use `.replace(/\\n/g, '\n')` on private_key from env |
| `getDownloadURL throws "No download token"` | File has no Firebase metadata | Use the direct GCS URL instead: `https://storage.googleapis.com/BUCKET/path` |
| `File too large (10MB limit)` | Image exceeds multer limit | Compress image first, or increase `limits.fileSize` |
| `Unsupported file type` | Wrong MIME type (e.g., HEIC) | Convert to JPEG/PNG before upload |

## Verification Checklist

- [ ] `POST /api/upload` with a test JPEG returns 200 with `imageUrl`
- [ ] The `imageUrl` is accessible in browser (no auth required)
- [ ] Files appear in Firebase Console → Storage → `bills/` folder
- [ ] Unique filenames prevent collisions (timestamp prefix)
- [ ] Invalid file types are rejected with a clear error message
- [ ] Files over 10MB are rejected before upload
- [ ] Error responses include descriptive messages (not raw stack traces)
