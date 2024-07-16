import sharp from 'sharp';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const { fileContent, fileName } = event;

  const bucketName = process.env.S3_BUCKET_NAME;

  try {
    // 파일 압축
    const compressedBuffer = await sharp(Buffer.from(fileContent, 'base64'))
      .resize(400, 400)
      .toBuffer();

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: compressedBuffer,
    };

    const data = await s3.upload(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ fileId: data.Location }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'File upload failed', details: err.message }),
    };
  }
};
