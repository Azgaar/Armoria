import {createHash, randomBytes, scrypt, timingSafeEqual} from "node:crypto";

const PREFIX = "scrypt$131072$8$1";
const OPTIONS = {N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024};

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 32, OPTIONS, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashClaimPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `${PREFIX}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyClaimPassword(password: string, hash: unknown): Promise<boolean> {
  if (typeof hash !== "string" || !/^scrypt\$131072\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(hash)) return false;
  const parts = hash.split("$");
  const actual = await derive(password, Buffer.from(parts[4], "hex"));
  return timingSafeEqual(actual, Buffer.from(parts[5], "hex"));
}

// Fixed-length comparison for legacy plaintext passwords and the administrator secret.
export function sameSecret(supplied: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(supplied), digest(expected));
}

export type ClaimProtection = {key?: string; keyHash?: string};

export function isProtected(claim: ClaimProtection): boolean {
  return Object.hasOwn(claim, "keyHash") || (claim.key !== undefined && claim.key !== null && claim.key !== "");
}

export async function mayMutateClaim(claim: ClaimProtection, key: string, authorization: string | null, masterKey?: string) {
  if (masterKey?.trim() && authorization?.startsWith("Bearer ") && sameSecret(authorization.slice(7), masterKey)) return true;
  if (!isProtected(claim)) return true;
  if (!key) return false;
  // A corrupt/unknown hash never falls back to a legacy password or public access.
  if (Object.hasOwn(claim, "keyHash")) return verifyClaimPassword(key, claim.keyHash);
  return typeof claim.key === "string" && sameSecret(key, claim.key);
}
