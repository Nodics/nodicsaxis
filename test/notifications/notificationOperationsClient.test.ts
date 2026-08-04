import { describe, expect, it, vi } from 'vitest';

import { loadNotificationOperations } from '../../src/operations/notifications/api/notificationOperationsClient';

describe('Notification operations client', () => {
  it('loads the bearer-authenticated, enterprise-scoped safe projection', async () => {
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              bounded: false,
              counts: { SENT: 4, RETRY_SCHEDULED: 1 },
              recovery: {},
              windowHours: 24,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const result = await loadNotificationOperations(
      {
        moduleName: 'notifyApi',
        instanceId: 'i1',
        endpoint: 'https://notify.example/nodics/notifyApi',
        environment: 'test',
        state: 'UP',
      },
      'token',
      'enterprise1',
      1000,
      fetcher,
    );
    expect(result.counts.SENT).toBe(4);
    expect(fetcher.mock.calls[0]?.[0]).toEqual(
      new URL('https://notify.example/nodics/notifyApi/v0/operations/diagnostics'),
    );
    const init = fetcher.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer token');
    expect(headers.get('x-enterprise-code')).toBe('enterprise1');
    expect(init?.credentials).toBe('omit');
    expect(init?.redirect).toBe('error');
  });

  it('rejects unsafe endpoints and malformed projections', async () => {
    await expect(
      loadNotificationOperations(
        {
          moduleName: 'notifyApi',
          instanceId: 'i1',
          endpoint: 'file:///tmp/notify',
          environment: 'test',
          state: 'UP',
        },
        'token',
        'enterprise1',
        1000,
      ),
    ).rejects.toThrow('invalid');
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    await expect(
      loadNotificationOperations(
        {
          moduleName: 'notifyApi',
          instanceId: 'i1',
          endpoint: 'https://notify.example',
          environment: 'test',
          state: 'UP',
        },
        'token',
        'enterprise1',
        1000,
        fetcher,
      ),
    ).rejects.toThrow('does not contain data');
  });
});
