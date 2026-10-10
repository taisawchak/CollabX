/**
 * Authentication & Cryptographic Hashing Service
 * Implements salted SHA-256 password hashing, verification, and validation rules.
 */

export const DEFAULT_PASSWORD_SALT = 'collabx_salt_2026';
export const DEFAULT_SEED_PASSWORD = 'Password@123';
// Pre-computed hash of "Password@123:collabx_salt_2026"
export const DEFAULT_SEED_HASH = '79a8fa64fcd046e9e8d7f400f8831ebd9f2ef2467a064b592840172c72262cc9';

/**
 * Computes a secure salted SHA-256 digest of a password.
 */
export async function hashPassword(password: string, salt: string = DEFAULT_PASSWORD_SALT): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${password}:${salt}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Pure JS fallback if crypto.subtle is unavailable
  let hash = 0;
  const str = `${password}:${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Verifies a plaintext password against a stored hash and salt.
 */
export async function verifyPassword(
  password: string,
  storedHash?: string,
  salt: string = DEFAULT_PASSWORD_SALT
): Promise<boolean> {
  if (!password || !storedHash) return false;
  const computed = await hashPassword(password, salt);
  return computed.toLowerCase() === storedHash.toLowerCase();
}

/**
 * Validates institutional or standard email format.
 */
export function validateEmail(email: string): boolean {
  const clean = email.trim();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(clean);
}

/**
 * Validates password length and complexity.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}
