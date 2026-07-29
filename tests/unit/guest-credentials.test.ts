import { describe, it, expect } from 'vitest';
import { generateGuestCredentials } from '@/lib/utils/guest';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('generateGuestCredentials', () => {
  it('returns an email with the `guest-` prefix and the pastello.app domain', () => {
    const { email } = generateGuestCredentials();
    expect(email.startsWith('guest-')).toBe(true);
    expect(email.endsWith('@pastello.app')).toBe(true);
  });

  it('returns a valid UUID as the password', () => {
    const { password } = generateGuestCredentials();
    expect(UUID_REGEX.test(password)).toBe(true);
  });

  it('returns a valid UUID as the id', () => {
    const { id } = generateGuestCredentials();
    expect(UUID_REGEX.test(id)).toBe(true);
  });

  it('derives the email local part from the returned id', () => {
    const { email, id } = generateGuestCredentials();
    expect(email).toBe(`guest-${id.slice(0, 8)}@pastello.app`);
  });

  it('produces unique credentials on successive calls', () => {
    const a = generateGuestCredentials();
    const b = generateGuestCredentials();
    expect(a.id).not.toBe(b.id);
    expect(a.email).not.toBe(b.email);
    expect(a.password).not.toBe(b.password);
  });
});