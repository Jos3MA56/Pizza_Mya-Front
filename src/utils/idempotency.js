const KEY_PATTERN = /^[A-Za-z0-9:_-]{16,120}$/;

function randomId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createIdempotencyKey(prefix = "request") {
  const safePrefix = String(prefix || "request")
    .trim()
    .replace(/[^A-Za-z0-9:_-]/g, "_")
    .slice(0, 40);

  return `${safePrefix}:${randomId()}`;
}

export function assertIdempotencyKey(value, message = "Idempotency-Key inválida") {
  const key = String(value || "").trim();

  if (!KEY_PATTERN.test(key)) {
    const error = new Error(message);
    error.code = "INVALID_IDEMPOTENCY_KEY";
    throw error;
  }

  return key;
}

export function getOrCreateIdempotencyKey({
  storageKey,
  prefix,
  fingerprint = "",
}) {
  const finalStorageKey = String(storageKey || "").trim();

  if (!finalStorageKey) {
    throw new Error("Falta la clave de almacenamiento idempotente");
  }

  const finalFingerprint = String(fingerprint || "");

  try {
    const raw = sessionStorage.getItem(finalStorageKey);
    const saved = raw ? JSON.parse(raw) : null;

    if (
      saved?.key &&
      KEY_PATTERN.test(saved.key) &&
      String(saved.fingerprint || "") === finalFingerprint
    ) {
      return saved.key;
    }
  } catch {
    sessionStorage.removeItem(finalStorageKey);
  }

  const key = createIdempotencyKey(prefix);

  sessionStorage.setItem(
    finalStorageKey,
    JSON.stringify({
      key,
      fingerprint: finalFingerprint,
      createdAt: new Date().toISOString(),
    }),
  );

  return key;
}

export function clearIdempotencyKey(storageKey) {
  if (storageKey) {
    sessionStorage.removeItem(storageKey);
  }
}
