import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number },
) => Promise<Buffer>;

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };
const DEK_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const DEK_AAD = Buffer.from("zelthia:dek:v1", "utf8");
const FILE_MAGIC = Buffer.from([0x5a, 0x45, 0x4e, 0x43, 0x01]); // "ZENC\x01"

export const CURRENT_TERMS_VERSION = "2026-11-26-dpa2018-ndpa";

/** Constant dummy hash (16-byte salt, 64-byte key) used so failed sign-ins spend uniform scrypt time. */
export const DUMMY_PASSWORD_HASH =
  "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, SCRYPT_OPTS);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scrypt(
    password,
    Buffer.from(saltB64, "base64"),
    64,
    SCRYPT_OPTS,
  );
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const sha256Hex = (v: string) =>
  createHash("sha256").update(v).digest("hex");

/* ---------- Per-user Data Encryption Key (DEK) ---------- */

export function generateDek(): Buffer {
  return randomBytes(DEK_BYTES);
}

/**
 * Wraps the random 256-bit DEK with a KEK derived from the user's password via scrypt.
 * Only someone possessing the password (or the active split-key session cookie) can unwrap it.
 */
export async function wrapDek(dek: Buffer, password: string): Promise<string> {
  if (dek.length !== DEK_BYTES) {
    throw new Error("DEK must be 32 bytes");
  }
  const salt = randomBytes(16);
  const kek = await scrypt(password, salt, DEK_BYTES, SCRYPT_OPTS);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", kek, iv);
  cipher.setAAD(DEK_AAD);
  const ct = Buffer.concat([cipher.update(dek), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    salt.toString("base64"),
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join("$");
}

export async function unwrapDek(
  wrapped: string,
  password: string,
): Promise<Buffer> {
  const [version, saltB64, ivB64, tagB64, ctB64] = wrapped.split("$");
  if (version !== "v1" || !saltB64 || !ivB64 || !tagB64 || !ctB64) {
    throw new Error("Invalid wrapped DEK format");
  }
  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const kek = await scrypt(password, salt, DEK_BYTES, SCRYPT_OPTS);
  const decipher = createDecipheriv("aes-256-gcm", kek, iv);
  decipher.setAAD(DEK_AAD);
  decipher.setAuthTag(tag);
  const dek = Buffer.concat([decipher.update(ct), decipher.final()]);
  if (dek.length !== DEK_BYTES) {
    throw new Error("Unwrapped DEK length mismatch");
  }
  return dek;
}

/* ---------- AEAD field & binary encryption ---------- */

export function encryptText(
  plaintext: string,
  dek: Buffer,
  aad: string,
): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", dek, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1$${iv.toString("base64")}$${tag.toString("base64")}$${ct.toString("base64")}`;
}

export function decryptText(encoded: string, dek: Buffer, aad: string): string {
  const [prefix, ivB64, tagB64, ctB64] = encoded.split("$");
  if (prefix !== "enc:v1" || !ivB64 || !tagB64 || ctB64 === undefined) {
    throw new Error("Invalid encrypted field format");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", dek, iv);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString(
    "utf8",
  );
}

export function isEncryptedBytes(blob: Buffer): boolean {
  return (
    blob.length >= FILE_MAGIC.length + IV_BYTES + TAG_BYTES &&
    blob.subarray(0, FILE_MAGIC.length).equals(FILE_MAGIC)
  );
}

export function encryptBytes(data: Buffer, dek: Buffer, aad: string): Buffer {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", dek, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ct = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([FILE_MAGIC, iv, tag, ct]);
}

export function decryptBytes(blob: Buffer, dek: Buffer, aad: string): Buffer {
  if (!isEncryptedBytes(blob)) {
    throw new Error("Invalid encrypted file header");
  }
  const ivStart = FILE_MAGIC.length;
  const tagStart = ivStart + IV_BYTES;
  const ctStart = tagStart + TAG_BYTES;
  const iv = blob.subarray(ivStart, tagStart);
  const tag = blob.subarray(tagStart, ctStart);
  const ct = blob.subarray(ctStart);
  const decipher = createDecipheriv("aes-256-gcm", dek, iv);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/* ---------- Deterministic AAD context builders ---------- */

export const aadProfile = (userId: string) =>
  `zelthia:v1:user:${userId}:profile`;
export const aadConvTitle = (userId: string, convId: string) =>
  `zelthia:v1:user:${userId}:conv:${convId}:title`;
export const aadMessage = (userId: string, convId: string, msgId: string) =>
  `zelthia:v1:user:${userId}:conv:${convId}:msg:${msgId}`;
export const aadAttachmentText = (userId: string, attId: string) =>
  `zelthia:v1:user:${userId}:att:${attId}:text`;
export const aadAttachmentFile = (userId: string, attId: string) =>
  `zelthia:v1:user:${userId}:att:${attId}:file`;
