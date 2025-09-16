// app/api/s3/presign/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const s3 = new S3Client({
  region: getRequiredEnv('REGION'),
  credentials: {
    accessKeyId: getRequiredEnv('ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('SECRET_ACCESS_KEY'),
  },
});

const Body = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^[\w.+-]+\/[\w.+-]+$/),
  maxSizeMB: z.number().min(1).max(100).optional(),
  folder: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { fileName, fileType, folder } = Body.parse(json);
    const key = sanitize(fileName);
    // Generate a safe object key. Prefix with a namespace/folder and date buckets.

    const cmd = new PutObjectCommand({
      Bucket: getRequiredEnv('NEXT_PUBLIC_ESB_COMPETITOR_ASSETS'),
      Key: `${folder ?? "competitors/"}${key}`,
      ContentType: fileType,            // enforce on the upload
      // Recommended security (pick one):
      // ServerSideEncryption: "AES256",
      // OR KMS:
      // ServerSideEncryption: "aws:kms",
      // SSEKMSKeyId: process.env.S3_KMS_KEY_ID,
      // Optional: Cache policy for CDN-able assets
      // CacheControl: "public, max-age=31536000, immutable",
    });

    // Short expiry keeps risk low (60–300s)
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });

    return Response.json({ url, key });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message ?? "Bad Request" }), { status: 400 });
    } else {
      console.error(err);
      return new Response(JSON.stringify({ error: "Bad Request" }), { status: 400 });
    }
  }
}

function sanitize(name: string) {
  // basic key safety
  return name.replace(/[^\w.\-+]/g, "_");
}
