import crypto from "node:crypto";

export function createClientId(prefix = "id") {
  const normalizedPrefix =
    String(prefix || "id")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "id";

  const webCrypto = globalThis?.crypto;

  if (webCrypto?.randomUUID) {
    return `${normalizedPrefix}-${webCrypto.randomUUID()}`;
  }

  const randomChunk = crypto.randomUUID();
  return `${normalizedPrefix}-${Date.now()}-${randomChunk}`;
}

export function createShortClientId(prefix = "id") {
  const normalizedPrefix =
    String(prefix || "id")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "id";

  const webCrypto = globalThis?.crypto;

  if (webCrypto?.randomUUID) {
    return `${normalizedPrefix}-${webCrypto.randomUUID().split("-")[0]}`;
  }

  return `${normalizedPrefix}-${crypto.randomUUID().split("-")[0]}`;
}
