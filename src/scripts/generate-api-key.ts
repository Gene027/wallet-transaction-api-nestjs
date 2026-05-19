import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { encryptApiKey } from '../common/crypto/api-key';

dotenv.config();

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

if (require.main === module) {
  main();
}
