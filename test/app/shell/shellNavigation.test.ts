import { describe, expect, it } from 'vitest';

import { composeShellNavigation } from '../../../src/app/shell/shellNavigation';

describe('Axis shell navigation composition', () => {
  it('keeps the local dashboard and groups backend-authorized capabilities', () => {
    const groups = composeShellNavigation([
      {
        id: 'cms',
        label: 'Content',
        route: '/content',
        order: 200,
        moduleName: 'cms',
        category: 'content',
        icon: 'content',
        availability: 'UP',
      },
      {
        id: 'pricing',
        label: 'Pricing',
        route: '/pricing',
        order: 420,
        moduleName: 'pricing',
        category: 'commerce',
        icon: 'price',
        availability: 'DEGRADED',
      },
    ]);

    expect(groups.map((group) => group.label)).toEqual([
      'Workspace',
      'Content and Experience',
      'Commerce',
    ]);
    expect(groups[0]?.items[0]).toEqual(
      expect.objectContaining({ label: 'Dashboard', local: true }),
    );
    expect(groups[2]?.items[0]).toEqual(
      expect.objectContaining({ label: 'Pricing', availability: 'DEGRADED' }),
    );
  });
});
