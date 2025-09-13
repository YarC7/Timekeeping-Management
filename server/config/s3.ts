// config/s3.js
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const s3Client = new S3Client({
  region: "us-east-1", // MinIO yêu cầu có region, để default
  endpoint: process.env.MINIO_ENDPOINT, // URL MinIO server
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});
