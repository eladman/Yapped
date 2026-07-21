import { randomBytes, randomUUID } from "crypto";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function newId(): string {
  return randomUUID();
}

/** Short, unguessable, URL-friendly slug for share links. */
export function newSlug(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return out;
}

/** Longer secret for the creator's admin link. */
export function newAdminToken(): string {
  return newSlug(24);
}
