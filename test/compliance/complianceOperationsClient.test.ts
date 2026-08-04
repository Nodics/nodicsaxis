import { describe, expect, it, vi } from 'vitest';
import { loadComplianceOperations } from '../../src/operations/compliance/api/complianceOperationsClient';

describe('Compliance operations client', () => {
  it('loads a bearer-authenticated bounded backend projection', async () => {
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              bounded: false,
              cases: { APPROVED: 2 },
              reviews: {},
              sla: { overdue: 0 },
              providers: [],
              executionAttempts: {},
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const result = await loadComplianceOperations(
      {
        moduleName: 'kycApi',
        instanceId: 'i1',
        endpoint: 'https://kyc.example/nodics/kyc',
        environment: 'test',
        state: 'UP',
      },
      'token',
      'e1',
      1000,
      fetcher,
    );
    expect(result.cases.APPROVED).toBe(2);
    expect(fetcher.mock.calls[0]?.[0]).toEqual(
      new URL('https://kyc.example/nodics/kyc/v0/management/dashboard'),
    );
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe(
      'Bearer token',
    );
  });
});
