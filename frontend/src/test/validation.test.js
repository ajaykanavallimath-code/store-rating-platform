import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  getPasswordCriteria
} from '../utils/validation';

describe('Frontend Validation Utilities', () => {
  describe('validateName', () => {
    it('should reject names shorter than 20 characters', () => {
      expect(validateName('John Doe')).toBe('Name must be at least 20 characters.');
    });

    it('should reject names longer than 60 characters', () => {
      const longName = 'A'.repeat(61);
      expect(validateName(longName)).toBe('Name must not exceed 60 characters.');
    });

    it('should accept valid names between 20 and 60 characters', () => {
      expect(validateName('Jonathan David Doe Consumer')).toBeNull();
    });

    it('should trim whitespace before checking length', () => {
      expect(validateName('   Short Name   ')).toBe('Name must be at least 20 characters.');
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBeNull();
      expect(validateEmail('admin.test@domain.co.uk')).toBeNull();
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address.');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address.');
      expect(validateEmail('')).toBe('Email address is required.');
    });
  });

  describe('validateAddress', () => {
    it('should accept valid address up to 400 characters', () => {
      expect(validateAddress('123 Main Street, Suite 400, New York, NY 10001')).toBeNull();
    });

    it('should reject empty address', () => {
      expect(validateAddress('')).toBe('Address is required.');
      expect(validateAddress('   ')).toBe('Address is required.');
    });

    it('should reject address over 400 characters', () => {
      const longAddress = 'A'.repeat(401);
      expect(validateAddress(longAddress)).toBe('Address must not exceed 400 characters.');
    });
  });

  describe('validatePassword and criteria', () => {
    it('should validate all password security requirements', () => {
      // Valid: 8-16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
      expect(validatePassword('StrongPass123!')).toBeNull();
    });

    it('should reject passwords shorter than 8 chars', () => {
      expect(validatePassword('Pass1!')).toBe('Password must be between 8 and 16 characters.');
    });

    it('should reject passwords longer than 16 chars', () => {
      expect(validatePassword('VeryLongPassword123456789!')).toBe('Password must be between 8 and 16 characters.');
    });

    it('should reject passwords missing uppercase', () => {
      expect(validatePassword('password123!')).toBe('Password must contain at least one uppercase letter.');
    });

    it('should reject passwords missing special character', () => {
      expect(validatePassword('Password1234')).toBe('Password must contain at least one special character.');
    });

    it('should correctly evaluate individual criteria flags', () => {
      const res = getPasswordCriteria('Pass1!');
      expect(res.minLength).toBe(false);
      expect(res.hasUpper).toBe(true);
      expect(res.hasLower).toBe(true);
      expect(res.hasNumber).toBe(true);
      expect(res.hasSpecial).toBe(true);
    });
  });
});
