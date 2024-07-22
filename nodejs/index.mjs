import sharp from 'sharp';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

async function optimizeImage(buffer) {
  const original = buffer;
  const compressed = await sharp(buffer)
    .resize({ width: 400, height: 400, fit: 'inside' })
    .jpeg({ quality: 50 })
    .toBuffer();

  if (compressed.length < original.length) {
    return compressed;
  } else {
    return original;
  }
}

export const handler = async (event) => {
  const { fileContent, fileName } = event;

  const bucketName = process.env.S3_BUCKET_NAME;

  try {
    const buffer = Buffer.from(fileContent, 'base64');
    console.log('Original Buffer Length:', buffer.length);

    const optimizedBuffer = await optimizeImage(buffer);
    console.log('Optimized Buffer Length:', optimizedBuffer.length);

    const newFileName = fileName.replace(/\.[^/.]+$/, '') + '.jpg';

    const params = {
      Bucket: bucketName,
      Key: newFileName,
      Body: optimizedBuffer,
      ContentType: 'image/jpeg',
    };

    const data = await s3.upload(params).promise();
    console.log('S3 업로드 결과:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ fileId: data.Location }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'File upload failed',
        details: err.message,
      }),
    };
  }
};
