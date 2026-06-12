import { describe, expect, it } from 'vitest';
import {
  AUTH_COOKIE_NAME,
  createAuthSession,
  getAuthCredentials,
  getPublicIdentity,
  readAuthSession,
} from '../server/authSession';

describe('auth session', () => {
  it('round-trips credentials through an encrypted cookie value', () => {
    const credentials = { school: '123456', user: 'alice', pass: 'secret' };
    const session = createAuthSession(credentials);

    expect(session).not.toContain(credentials.pass);
    expect(readAuthSession(session)).toEqual(credentials);
  });

  it('returns null for tampered session values', () => {
    const session = createAuthSession({ school: '123456', user: 'alice', pass: 'secret' });

    expect(readAuthSession(`${session}tampered`)).toBeNull();
  });

  it('extracts credentials from the HttpOnly session cookie value', () => {
    const credentials = { school: '123456', user: 'alice', pass: 'secret' };
    const session = createAuthSession(credentials);
    const request = new Request('https://example.test/api/stundenplan', {
      headers: { cookie: `other=1; ${AUTH_COOKIE_NAME}=${session}` },
    });

    expect(getAuthCredentials(request)).toEqual(credentials);
    expect(getPublicIdentity(credentials)).toEqual({ school: '123456', user: 'alice' });
  });
});
