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

  it('uses backend-owned groups and places children directly after their parent', () => {
    const group = { id: 'operations', label: 'Operations', order: 600 };
    const groups = composeShellNavigation([
      {
        id: 'administration',
        label: 'Administration',
        route: '/administration',
        order: 10,
        moduleName: 'backoffice',
        category: 'platform',
        icon: 'registry',
        availability: 'UP',
        group,
      },
      {
        id: 'registry',
        parentId: 'administration',
        label: 'Module Registry',
        route: '/registry',
        order: 20,
        moduleName: 'backoffice',
        category: 'platform',
        icon: 'registry',
        availability: 'UP',
        group,
      },
    ]);

    const operations = groups.find((entry) => entry.id === 'operations');
    expect(operations?.items.map((item) => [item.id, item.depth])).toEqual([
      ['administration', 0],
      ['registry', 1],
    ]);
    expect(operations?.items[0]?.hasChildren).toBe(true);
  });

  it('places explicit cross-module children below their backend-owned parent', () => {
    const group = { id: 'commerce', label: 'Commerce', order: 300 };
    const groups = composeShellNavigation([
      {
        id: 'commerce-operations',
        label: 'Commerce Operations',
        route: '/commerce/operations',
        order: 500,
        moduleName: 'gComm',
        category: 'commerce',
        icon: 'commerce',
        availability: 'UP',
        group,
      },
      {
        id: 'pricing',
        parentId: 'commerce-operations',
        parentModuleName: 'gComm',
        label: 'Pricing',
        route: '/commerce/operations/pricing',
        order: 520,
        moduleName: 'pricing',
        category: 'commerce',
        icon: 'pricing',
        availability: 'UP',
        group,
      },
    ]);

    const commerce = groups.find((entry) => entry.id === 'commerce');
    expect(
      commerce?.items.map((item) => [item.moduleName, item.id, item.depth]),
    ).toEqual([
      ['gComm', 'commerce-operations', 0],
      ['pricing', 'pricing', 1],
    ]);
    expect(commerce?.items[0]?.hasChildren).toBe(true);
  });
});
