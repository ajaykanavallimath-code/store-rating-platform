import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { signToken, verifyToken } from '../src/utils/jwt.js';

describe('Backend Auth Utilities (Password & JWT)', () => {
  it('hashes passwords and correctly compares matching and non-matching passwords', async () => {
    const plain = 'SecurePassword123!';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(plain, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword123!', hashed);
    expect(isWrongMatch).toBe(false);
  });

  it('signs and verifies JWT tokens with user payload', () => {
    const payload = { id: 42, role: 'ADMIN' };
    const token = signToken(payload);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.role).toBe('ADMIN');
  });

  it('throws error when verifying invalid or tampered tokens', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
