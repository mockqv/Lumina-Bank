import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CRYPTO_SECRET_KEY) {
  throw new Error('CRYPTO_SECRET_KEY must be defined in environment variables. It should be a 32-byte hex string.');
}

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(process.env.CRYPTO_SECRET_KEY, 'hex');

/**
 * Encrypts a piece of text.
 * @param text - The text to encrypt.
 * @returns The encrypted string in format iv:encrypted:authTag
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

/**
 * Decrypts a piece of text.
 * @param hash - The encrypted hash in format iv:encrypted:authTag
 * @returns The original decrypted text.
 */
export function decrypt(hash: string): string {
  const [ivHex, encryptedHex, authTagHex] = hash.split(':');
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error('Invalid encrypted format.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
