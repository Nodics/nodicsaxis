import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AxisBootstrap } from './AxisBootstrap';

const validConfig = {
  profileBaseUrl: 'http://localhost:3000',
  backofficeBaseUrl: 'http://localhost:3000',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
};

describe('AxisBootstrap', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the application only after configuration succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify(validConfig), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    render(<AxisBootstrap />);

    expect(screen.getByLabelText('Loading Axis configuration')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: 'One workspace for governed operations.',
      }),
    ).toBeInTheDocument();
  });

  it('fails safely and retries configuration', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(validConfig), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<AxisBootstrap />);

    expect(
      await screen.findByRole('heading', { name: 'Axis cannot start safely' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry configuration' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'One workspace for governed operations.',
        }),
      ).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
