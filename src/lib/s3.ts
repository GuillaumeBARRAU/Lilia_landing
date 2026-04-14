import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Config() {
  const region = process.env.AWS_REGION;
  const bucket =
    process.env.S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region) {
    throw new Error("AWS_REGION missing");
  }

  if (!bucket) {
    throw new Error("S3_BUCKET_NAME or AWS_S3_BUCKET missing");
  }

  if (!accessKeyId) {
    throw new Error("AWS_ACCESS_KEY_ID missing");
  }

  if (!secretAccessKey) {
    throw new Error("AWS_SECRET_ACCESS_KEY missing");
  }

  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
  };
}

function createS3Client() {
  const { region, accessKeyId, secretAccessKey } = getS3Config();

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function generateSignedPdfUrl(key: string) {
  const { bucket } = getS3Config();
  const s3 = createS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 120 });
}

export async function uploadPdfToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const { bucket } = getS3Config();
  const s3 = createS3Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType,
  });

  await s3.send(command);

  return { key: params.key };
}