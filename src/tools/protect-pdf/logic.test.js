import { describe, expect, it } from 'vitest';
import { buildPermissions, checkPasswords, getFacts, isWeak } from './logic.js';

describe('checkPasswords', () => {
  it('accepts matching passwords', () => expect(checkPasswords('secret1', 'secret1')).toEqual({}));
  it('needs at least 4 characters', () => expect(checkPasswords('abc', 'abc').password).toMatch(/at least 4/));
  it('accepts exactly 4 characters', () => expect(checkPasswords('abcd', 'abcd')).toEqual({}));
  it('limits the length', () => expect(checkPasswords('a'.repeat(128), 'a'.repeat(128)).password).toMatch(/at most 127/));
  it('needs a match', () => expect(checkPasswords('secret1', 'secret2').confirmation).toMatch(/do not match/));
  it('does not complain about the match until the password is valid', () => expect(checkPasswords('ab', 'x')).toEqual({ password: expect.any(String) }));
  it('keeps spaces and symbols exactly', () => expect(checkPasswords(' a b ', ' a b')).toHaveProperty('confirmation'));
});

it('calls short passwords weak', () => {
  expect(isWeak('abcdefghi')).toBe(true);
  expect(isWeak('abcdefghij')).toBe(false);
});

describe('buildPermissions', () => {
  it('allows printing and copying', () => expect(buildPermissions({ allowPrinting: true, allowCopying: true })).toMatchObject({ printing: 'highResolution', copying: true, modifying: false }));
  it('blocks them', () => expect(buildPermissions({ allowPrinting: false, allowCopying: false })).toMatchObject({ printing: false, copying: false }));
  it('keeps access for screen readers', () => expect(buildPermissions({ allowPrinting: false, allowCopying: false }).contentAccessibility).toBe(true));
});

it('lists the facts', () =>
  expect(getFacts({ allowPrinting: true, allowCopying: false }, { size: 2048 })).toEqual([
    { label: 'Encryption', value: 'AES-256' },
    { label: 'Printing', value: 'Allowed' },
    { label: 'Copying text', value: 'Not allowed' },
    { label: 'File size', value: '2 KB' },
  ]));
