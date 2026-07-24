import { describe, expect, it } from 'vitest';

import { parseRuntimeConfig } from '../../src/runtime/runtimeConfig';

const validConfig = {
  backofficeBaseUrl: 'https://backoffice.example.com/',
  enterpriseCode: 'default',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
};

describe('parseRuntimeConfig', () => {
  it('accepts and normalizes a safe configuration', () => {
    expect(parseRuntimeConfig(validConfig)).toEqual({
      backofficeBaseUrl: 'https://backoffice.example.com',
      enterpriseCode: 'default',
      clientContractVersion: 1,
      requestTimeoutMs: 10_000,
    });
  });

  it.each([
    ['relative URL', { ...validConfig, backofficeBaseUrl: '/backoffice' }],
    [
      'credentials',
      { ...validConfig, backofficeBaseUrl: 'https://user:secret@example.com' },
    ],
    ['unsupported scheme', { ...validConfig, backofficeBaseUrl: 'file:///tmp/api' }],
    ['zero contract version', { ...validConfig, clientContractVersion: 0 }],
    ['short timeout', { ...validConfig, requestTimeoutMs: 999 }],
    ['long timeout', { ...validConfig, requestTimeoutMs: 120_001 }],
    ['unknown field', { ...validConfig, password: 'must-not-be-here' }],
  ])('rejects %s', (_name, value) => {
    expect(() => parseRuntimeConfig(value)).toThrow();
  });
});
