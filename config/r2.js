import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME ?? "connecthub";
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL ?? null;

const isConfigured = accountId && accessKeyId && secretAccessKey;

const r2Client = isConfigured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    })
  : null;

export { r2Client, bucketName, publicBaseUrl, isConfigured };
