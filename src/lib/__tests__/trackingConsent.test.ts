// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readTrackingConsent, writeTrackingConsent, TRACKING_CONSENT_COOKIE } from '../trackingConsent';

function clearConsentCookie() {
  document.cookie = `${TRACKING_CONSENT_COOKIE}=; max-age=0; path=/`;
}

describe('readTrackingConsent', () => {
  beforeEach(clearConsentCookie);

  it('returns pending when no cookie is set', () => {
    expect(readTrackingConsent()).toBe('pending');
  });

  it('returns accepted when cookie is accepted', () => {
    writeTrackingConsent('accepted');
    expect(readTrackingConsent()).toBe('accepted');
  });

  it('returns rejected when cookie is rejected', () => {
    writeTrackingConsent('rejected');
    expect(readTrackingConsent()).toBe('rejected');
  });

  it('returns pending for unrecognised cookie values', () => {
    document.cookie = `${TRACKING_CONSENT_COOKIE}=unknown; path=/`;
    expect(readTrackingConsent()).toBe('pending');
  });
});

describe('writeTrackingConsent', () => {
  beforeEach(clearConsentCookie);

  it('writes accepted so it can be read back', () => {
    writeTrackingConsent('accepted');
    const raw = document.cookie;
    expect(raw).toContain(TRACKING_CONSENT_COOKIE);
    expect(raw).toContain('accepted');
  });

  it('overwrites a previous value', () => {
    writeTrackingConsent('accepted');
    writeTrackingConsent('rejected');
    expect(readTrackingConsent()).toBe('rejected');
  });
});

describe('SSR guard (document undefined)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('readTrackingConsent returns pending when document is undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(readTrackingConsent()).toBe('pending');
  });

  it('writeTrackingConsent does not throw when document is undefined', () => {
    vi.stubGlobal('document', undefined);
    expect(() => writeTrackingConsent('accepted')).not.toThrow();
  });
});
