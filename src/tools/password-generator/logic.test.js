import { describe, expect, it } from 'vitest';
import { DEFAULTS, estimateStrength, generatePassword, validate } from './logic.js';

describe('validate', () => {
  it.each(['', '3', '129', '10.5', 'abc'])('rejects a length of %j', (length) => {
    expect(validate({ ...DEFAULTS, length }).errors.length).toBeTruthy();
  });

  it('needs at least one type of character', () => {
    expect(validate({ ...DEFAULTS, upper: false, lower: false, digits: false, symbols: false }).errors.options).toBe('Please choose at least one type of character.');
  });

  it('accepts the defaults', () => {
    expect(validate(DEFAULTS)).toEqual({ errors: {}, length: 16 });
  });
});

describe('generatePassword', () => {
  it('has the right length and every chosen type', () => {
    for (let run = 0; run < 200; run += 1) {
      const password = generatePassword(DEFAULTS, 4);
      expect(password).toHaveLength(4);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^A-Za-z0-9]/);
    }
  });

  it('uses only the chosen types', () => {
    expect(generatePassword({ ...DEFAULTS, upper: false, lower: false, symbols: false }, 64)).toMatch(/^[0-9]{64}$/);
  });

  it('can skip look-alike characters', () => {
    expect(generatePassword({ ...DEFAULTS, skipLookAlike: true }, 128)).not.toMatch(/[O0Il1|]/);
  });

  it('is different each time', () => {
    expect(generatePassword(DEFAULTS, 32)).not.toBe(generatePassword(DEFAULTS, 32));
  });
});

describe('estimateStrength', () => {
  const only = (types) => ({ ...DEFAULTS, upper: false, lower: false, digits: false, symbols: false, ...types });

  it.each([
    [only({ lower: true }), 8, 38, 'Weak'],
    [only({ upper: true, lower: true, digits: true }), 12, 71, 'Strong'],
    [DEFAULTS, 16, 103, 'Very strong'],
    [only({ digits: true }), 15, 50, 'Fair'],
  ])('rates %#', (settings, length, bits, label) => {
    expect(estimateStrength(settings, length)).toEqual({ bits, label });
  });
});
