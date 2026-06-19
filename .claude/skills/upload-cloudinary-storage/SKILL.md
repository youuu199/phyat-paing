---
name: bill-organizer:upload-cloudinary-storage
description: Handles the multer→Cloudinary upload step in isolation. Use for testing Cloudinary connectivity, upload_stream for Buffer uploads, and secure URL generation independently of the OCR/AI pipeline.
---

# Upload Image to Cloudinary

Handles the image upload step independently — multer config, Cloudinary `upload_stream()` for Buffer uploads, and secure URL generation. Use this to verify Cloudinary connectivity before running the full pipeline.

## When to Use

- Initial Cloudinary setup verification
- Testing upload from Buffer (not file path — we use multer `memoryStorage`)
- Debugging upload failures (wrong folder, credentials, file type)
- Isolating upload issues from OCR/AI issues in the pipeline

## Prerequisites

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `server/.env`
- `cloudinary` installed: `npm install cloudinary`
- `multer` installed: `npm install multer`

## Configuration (`server/src/utils/cloudinaryStorage.js`)

```javascript
import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function ensureConfig() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export async function uploadToCloudinary(buffer, originalname, mimetype) {
  ensureConfig();
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const safeName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bill-organizer',
        public_id: `${timestamp}_${safeName}`,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}
```

## Testing

### Test 1: Standalone upload script
```javascript
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const demoImage = await fetch('https://res.cloudinary.com/demo/image/upload/sample.jpg');
const buffer = Buffer.from(await demoImage.arrayBuffer());

const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'test', public_id: `smoke_${Date.now()}`, resource_type: 'image' },
    (err, res) => err ? reject(err) : resolve(res)
  );
  stream.end(buffer);
});

console.log('✓ Uploaded:', result.secure_url);
console.log('  Public ID:', result.public_id);
console.log('  Size:', result.bytes, 'bytes');
console.log('  Format:', result.format);

// Cleanup
await cloudinary.uploader.destroy(result.public_id);
```

### Test 2: cURL upload via the API
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/test-bill.jpg"
```
Expected response:
```json
{
  "message": "File uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/dnb4v9gpi/image/upload/v.../bill-organizer/....jpg",
  "originalName": "test-bill.jpg",
  "size": 123456
}
```

### Test 3: Verify URL is accessible
```bash
curl -I <imageUrl>
# Should return HTTP/2 200 with content-type: image/jpeg
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `req.file is undefined` | Form field name mismatch | Use `-F "image=@file.jpg"` (field name must match `upload.single('image')`) |
| `Cannot read properties of undefined (reading 'upload_stream')` | Imported `cloudinary` not `cloudinary.v2` | Use `import { v2 as cloudinary } from 'cloudinary'` |
| `Cloud config is not specified` | Env vars missing | Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `400 Bad Request: Invalid public id` | Special characters in public_id | Sanitize filename: `.replace(/[^a-zA-Z0-9._-]/g, '_')` |
| `401 Unauthorized` (HTTP 401) | Wrong api_key or api_secret | Verify credentials at https://console.cloudinary.com/app/settings/api-keys |
| `404 Not Found` | Wrong cloud_name | Check cloud_name matches Cloudinary dashboard |
| `Request Timeout` | Buffer too large | Compress image before upload (Cloudinary limit is 10 MB free) |
| `upload_stream is not a function` | Using `upload(buffer)` — wrong method | Use `upload_stream()` for Buffer uploads. `upload()` expects file path or URL |
| `Resource not found` on destroy | public_id doesn't exist or already deleted | Destroy returns `{ result: 'not found' }` — not an error, just already gone |

## Verification Checklist

- [ ] `POST /api/upload` with a test JPEG returns 200 with `imageUrl`
- [ ] The `imageUrl` is an HTTPS Cloudinary URL (`res.cloudinary.com/...`)
- [ ] Files appear in Cloudinary Console → Media Library → `bill-organizer` folder
- [ ] Unique filenames prevent collisions (timestamp prefix)
- [ ] Delete removes the image from Cloudinary (`cloudinary.uploader.destroy()`)
- [ ] Error responses include descriptive messages (not raw stack traces)
