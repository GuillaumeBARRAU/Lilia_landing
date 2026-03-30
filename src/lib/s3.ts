import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region) throw new Error("AWS_REGION missing");
if (!bucket) throw new Error("S3_BUCKET_NAME missing");
if (!accessKeyId) throw new Error("AWS_ACCESS_KEY_ID missing");
if (!secretAccessKey) throw new Error("AWS_SECRET_ACCESS_KEY missing");

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function generateSignedPdfUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 120 });
}