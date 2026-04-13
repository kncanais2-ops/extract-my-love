import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFp: string | null = null;

export async function getFingerprint(): Promise<string> {
  if (cachedFp) return cachedFp;
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedFp = result.visitorId;
  return cachedFp;
}
