import { describe, expect, it, vi } from 'vitest';

import {
  loadWorkbenchPreferences,
  saveWorkbenchPreferences,
  schemaPreferenceKey,
} from '../../../src/workbench/preferences/workbenchPreferences';

const scope = {
  employeeId: 'admin',
  tenantCode: 'default',
  enterpriseCode: 'default',
};

describe('Workbench preferences', () => {
  it('stores bounded UI preferences without records or credentials', () => {
    let saved = '';
    const storage = {
      getItem: vi.fn(() => saved || null),
      setItem: vi.fn((_key: string, value: string) => {
        saved = value;
      }),
    };
    const key = schemaPreferenceKey('profile', 'tenant');
    expect(
      saveWorkbenchPreferences(
        scope,
        {
          favoriteSchemas: [key],
          recentSchemas: [key],
          schemaPreferences: {
            [key]: {
              visibleColumns: ['code', 'description'],
              savedViews: [
                {
                  name: 'Active tenants',
                  search: '',
                  filters: {
                    operator: 'AND',
                    items: [{ field: 'active', operator: 'EQUALS', value: true }],
                  },
                  pageSize: 25,
                  sort: { field: 'code', direction: 'ASC' },
                  visibleColumns: ['code', 'description'],
                },
              ],
            },
          },
        },
        storage,
      ),
    ).toBe(true);
    expect(saved).not.toContain('accessToken');
    expect(loadWorkbenchPreferences(scope, storage)).toMatchObject({
      favoriteSchemas: [key],
      recentSchemas: [key],
      schemaPreferences: {
        [key]: {
          visibleColumns: ['code', 'description'],
          savedViews: [{ name: 'Active tenants' }],
        },
      },
    });
  });

  it('fails closed for malformed or oversized local state', () => {
    expect(
      loadWorkbenchPreferences(scope, {
        getItem: () => '{not-json',
      }),
    ).toMatchObject({ favoriteSchemas: [], recentSchemas: [] });
    expect(
      loadWorkbenchPreferences(scope, {
        getItem: () => 'x'.repeat(50_001),
      }),
    ).toMatchObject({ favoriteSchemas: [], recentSchemas: [] });
  });
});
