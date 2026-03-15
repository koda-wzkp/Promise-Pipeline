/**
 * Cryptographic verification commitments for Promise Pipeline.
 *
 * When a promise's status is verified, the verification source (a DEQ report URL,
 * a PUC order number, a sensor reading) is cryptographically committed via SHA-256.
 * This transforms the platform from "trust us, we checked" to "here's proof of
 * what we checked and when."
 */

/**
 * Generate a SHA-256 hash of verification source content.
 * Uses the Web Crypto API (available in all modern browsers and Node 18+).
 *
 * The hash commits to a specific document at a specific time.
 * Anyone with access to the original document can verify the hash matches.
 * The document itself is not stored — only the commitment.
 */
export async function generateVerificationHash(
  sourceContent: string,
  sourceDigest: string,
): Promise<{
  hash: string;
  timestamp: string;
  sourceDigest: string;
}> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sourceContent);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    hash,
    timestamp: new Date().toISOString(),
    sourceDigest,
  };
}

/**
 * Verify a commitment against source content.
 * Returns true if the hash matches.
 */
export async function verifyCommitment(
  sourceContent: string,
  expectedHash: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sourceContent);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const actualHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return actualHash === expectedHash;
}
