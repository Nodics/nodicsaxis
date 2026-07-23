import { describe, expect, it } from 'vitest';

import { parseRuntimeConfig } from './runtimeConfig';

const validConfig = {
  profileBaseUrl: 'http://localhost:3000',
  backofficeBaseUrl: 'https://backoffice.example.com/',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
};

describe('parseRuntimeConfig', () => {
  it('accepts and normalizes a safe configuration', () => {
    expect(parseRuntimeConfig(validConfig)).toEqual({
      profileBaseUrl: 'http://localhost:3000',
      backofficeBaseUrl: 'https://backoffice.example.com',
      clientContractVersion: 1,
      requestTimeoutMs: 10_000,
    });
  });

  it.each([
    ['relative URL', { ...validConfig, profileBaseUrl: '/profile' }],
    [
      'credentials',
      { ...validConfig, profileBaseUrl: 'https://user:secret@example.com' },
    ],
    ['unsupported scheme', { ...validConfig, profileBaseUrl: 'file:///tmp/api' }],
    ['zero contract version', { ...validConfig, clientContractVersion: 0 }],
    ['short timeout', { ...validConfig, requestTimeoutMs: 999 }],
    ['long timeout', { ...validConfig, requestTimeoutMs: 120_001 }],
    ['unknown field', { ...validConfig, password: 'must-not-be-here' }],
  ])('rejects %s', (_name, value) => {
    expect(() => parseRuntimeConfig(value)).toThrow();
  });
});
