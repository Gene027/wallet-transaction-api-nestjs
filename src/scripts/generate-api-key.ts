import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(merchantId: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(16);
  const payload = JSON.stringify({ merchantId, createdAt: new Date().toISOString() });

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
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

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  const payload = JSON.parse(decrypted.toString('utf8')) as { merchantId: string };
  return payload.merchantId;
}

function main() {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    console.error('Error: API_KEY_SECRET is not set in your .env file');
    process.exit(1);
  }

  // uses the merchant id from the command line if provided, otherwise generates a new one
  const merchantId = process.argv[2] ?? crypto.randomUUID();
  const apiKey = encryptApiKey(merchantId, secret);

  console.log('');
  console.log('Generated API Key');
  console.log('─────────────────────────────────────────');
  console.log(`Merchant ID : ${merchantId}`);
  console.log(`API Key     : ${apiKey}`);
  console.log('');
  console.log('Store the API Key securely — it cannot be recovered if lost.');
  console.log('');
}

main();
