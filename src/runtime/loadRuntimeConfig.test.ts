import { describe, expect, it, vi } from 'vitest';

import { loadRuntimeConfig } from './loadRuntimeConfig';

const validConfig = {
  profileBaseUrl: 'http://localhost:3000',
  backofficeBaseUrl: 'http://localhost:3000',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
};

describe('loadRuntimeConfig', () => {
  it('requests runtime configuration without cache', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(validConfig), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(loadRuntimeConfig(fetchImplementation)).resolves.toEqual(validConfig);
    expect(fetchImplementation).toHaveBeenCalledWith(
      '/axis-config.json',
      expect.objectContaining({
        cache: 'no-store',
        credentials: 'same-origin',
      }),
    );
  });

  it('reports an unavailable configuration without exposing transport details', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error('secret network detail'));

    await expect(loadRuntimeConfig(fetchImplementation)).rejects.toThrow(
      'Axis runtime configuration could not be reached',
    );
  });

  it('rejects a failed HTTP response', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 503 }));

    await expect(loadRuntimeConfig(fetchImplementation)).rejects.toThrow('HTTP 503');
  });
});
