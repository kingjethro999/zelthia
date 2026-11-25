import "server-only";
import { fetchService } from "./http";
import { createHash } from "node:crypto";

/** Private Cloudinary storage: assets are `authenticated` and served via our API only. */

function creds() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_SECRET;
  if (!cloud || !key || !secret)
    throw new Error("Cloudinary is not configured");
  return { cloud, key, secret };
}

function sign(params: Record<string, string | number>, secret: string) {
  const base = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(base + secret)
    .digest("hex");
}

export interface StoredFile {
  storageId: string;
  resourceType: string;
  format: string;
}

export async function uploadPrivate(
  dataUri: string,
  folder: string,
): Promise<StoredFile> {
  const { cloud, key, secret } = creds();
  const params = {
    folder,
    timestamp: Math.floor(Date.now() / 1000),
    type: "authenticated",
  };
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", key);
  form.append("signature", sign(params, secret));
  form.append("file", dataUri);
  const res = await fetchService(
    "Cloudinary",
    `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
    {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30000),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error)
    throw new Error(data.error?.message ?? `Upload failed (${res.status})`);
  return {
    storageId: data.public_id,
    resourceType: data.resource_type,
    format: data.format ?? "",
  };
}

/** Fetches a private asset using a short-lived signed download request. */
export async function downloadPrivate(file: StoredFile): Promise<Response> {
  const { cloud, key, secret } = creds();
  const now = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    public_id: file.storageId,
    type: "authenticated",
    timestamp: now,
    expires_at: now + 300,
  };
  if (file.format) params.format = file.format;
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  );
  qs.set("api_key", key);
  qs.set("signature", sign(params, secret));
  return fetchService(
    "Cloudinary",
    `https://api.cloudinary.com/v1_1/${cloud}/${file.resourceType}/download?${qs}`,
    {
      signal: AbortSignal.timeout(30000),
    },
  );
}

export async function deletePrivate(file: StoredFile) {
  const { cloud, key, secret } = creds();
  const params = {
    public_id: file.storageId,
    timestamp: Math.floor(Date.now() / 1000),
    type: "authenticated",
  };
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", key);
  form.append("signature", sign(params, secret));
  const res = await fetchService(
    "Cloudinary",
    `https://api.cloudinary.com/v1_1/${cloud}/${file.resourceType}/destroy`,
    {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(20000),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(
      `Delete failed for ${file.storageId}: ${data.error?.message ?? data.result ?? res.status}`,
    );
  }
}
