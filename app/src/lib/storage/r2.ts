import "server-only";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Stockage vidéo Cloudflare R2 (D7, 6.0 §5) — API S3.
 * Uploads : URLs présignées PUT (le fichier ne transite jamais par Vercel).
 * Diffusion v1 : les rendus HLS publiés sont servis via l'URL publique du
 * bucket (`R2_PUBLIC_BASE_URL`) — contenu public par nature (H90) ; les URLs
 * signées HMAC par session (D7) arrivent avec le Worker dédié.
 */

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

let client: S3Client | null = null;

function r2(): S3Client {
  if (!isR2Configured()) throw new Error("R2 non configuré");
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return client;
}

const bucket = () => process.env.R2_BUCKET as string;

/** URL présignée pour téléverser la source (PUT direct navigateur → R2). */
export async function presignSourceUpload(key: string, contentType: string, expiresSeconds = 3600): Promise<string> {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: expiresSeconds },
  );
}

/** URL présignée de lecture (utilisée par le job d'encodage et la modération). */
export async function presignRead(key: string, expiresSeconds = 3600): Promise<string> {
  return getSignedUrl(r2(), new GetObjectCommand({ Bucket: bucket(), Key: key }), {
    expiresIn: expiresSeconds,
  });
}

/** URL publique d'un rendu publié (manifeste HLS, affiche). */
export function publicUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  return base ? `${base.replace(/\/$/, "")}/${key}` : null;
}
