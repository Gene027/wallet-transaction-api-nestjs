import * as crypto from 'crypto';

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(merchantId: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(16);
  const payload = JSON.stringify({
    merchantId,
    createdAt: new Date().toISOString(),
  });

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(payload, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, authTag, encrypted]);
  return 'wt_' + combined.toString('base64url');
}

export function decryptApiKey(apiKey: string, secret: string): string {
  if (!apiKey.startsWith('wt_')) throw new Error('Invalid API key format');

  const buffer = Buffer.from(apiKey.slice(3), 'base64url');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);

  const key = deriveKey(secret);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  const payload = JSON.parse(decrypted.toString('utf8')) as {
    merchantId: string;
  };
  return payload.merchantId;
}
