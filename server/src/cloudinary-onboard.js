import { v2 as cloudinary } from 'cloudinary';

// --------------- Step 1: Configure Cloudinary ---------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --------------- Helper: upload from Buffer ---------------
function uploadFromBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// --------------- Main ---------------
async function main() {
  // Step 2: Upload sample image from Cloudinary demo
  const demoImageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  console.log('Uploading sample image from Cloudinary demo...');
  const response = await fetch(demoImageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const result = await uploadFromBuffer(buffer, {
    folder: 'bill-organizer-test',
    public_id: `onboarding-test-${Date.now()}`,
  });

  console.log('\n--- Upload Result ---');
  console.log('Public ID :', result.public_id);
  console.log('Secure URL:', result.secure_url);

  // Step 3: Get image details (metadata)
  console.log('\n--- Image Details ---');
  console.log('Width     :', result.width, 'px');
  console.log('Height    :', result.height, 'px');
  console.log('Format    :', result.format);
  console.log('File size :', result.bytes, 'bytes');
  console.log('Created   :', result.created_at);

  // Step 4: Generate transformed URL with f_auto + q_auto
  // f_auto = automatic format selection (WebP/AVIF if browser supports, fallback to original)
  // q_auto = automatic quality (reduces file size while keeping visual quality)
  const transformedUrl = cloudinary.url(result.public_id, {
    fetch_format: 'auto',   // f_auto
    quality: 'auto',        // q_auto
    secure: true,
  });

  console.log('\n========================================');
  console.log('Done! Click the link below to see the optimized version.');
  console.log('Compare the file size and format vs the original.');
  console.log('========================================');
  console.log(transformedUrl);

  // Cleanup — delete the test image
  const deleteResult = await cloudinary.uploader.destroy(result.public_id);
  console.log('\nCleaned up test image:', deleteResult.result);
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
