import { describe, expect, it } from 'vitest';

import { buildRuntimeConfig } from '../../vite.config';

const validEnvironment = {
  AXIS_BACKOFFICE_BASE_URL: 'https://backoffice.example.com/',
  AXIS_ENTERPRISE_CODE: 'default',
  AXIS_CLIENT_CONTRACT_VERSION: '1',
  AXIS_REQUEST_TIMEOUT_MS: '10000',
};

describe('Axis environment configuration', () => {
  it('maps explicit public environment values into the runtime contract', () => {
    expect(buildRuntimeConfig(validEnvironment)).toEqual({
      backofficeBaseUrl: 'https://backoffice.example.com',
      enterpriseCode: 'default',
      clientContractVersion: 1,
      requestTimeoutMs: 10000,
    });
  });

  it.each([
    ['missing enterprise code', { ...validEnvironment, AXIS_ENTERPRISE_CODE: '' }],
    [
      'credential-bearing BackOffice URL',
      {
        ...validEnvironment,
        AXIS_BACKOFFICE_BASE_URL: 'https://user:secret@example.com',
      },
    ],
    [
      'invalid contract version',
      { ...validEnvironment, AXIS_CLIENT_CONTRACT_VERSION: 'latest' },
    ],
    [
      'timeout above the runtime boundary',
      { ...validEnvironment, AXIS_REQUEST_TIMEOUT_MS: '120001' },
    ],
  ])('rejects %s', (_caseName, environment) => {
    expect(() => buildRuntimeConfig(environment)).toThrow();
  });
});
