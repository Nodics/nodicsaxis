import { describe, expect, it } from 'vitest';

import { cmsPageQueryKey } from '../../src/cms/cmsQuery';

const publicContext = {
  enterpriseCode: 'default',
  tenantCode: 'default',
  site: 'axisCmsSite',
  path: '/login',
  locale: 'en',
  channel: 'web',
  access: 'public' as const,
};

describe('cmsPageQueryKey', () => {
  it('isolates public content by enterprise, tenant, site, locale, and channel', () => {
    const base = cmsPageQueryKey(publicContext);
    expect(base).not.toEqual(
      cmsPageQueryKey({ ...publicContext, tenantCode: 'another-tenant' }),
    );
    expect(base).not.toEqual(cmsPageQueryKey({ ...publicContext, locale: 'fr' }));
  });

  it('isolates authenticated data by principal and session generation', () => {
    const first = cmsPageQueryKey({
      ...publicContext,
      access: 'authenticated',
      principalId: 'employee-a',
      sessionGeneration: 1,
    });
    expect(first).not.toEqual(
      cmsPageQueryKey({
        ...publicContext,
        access: 'authenticated',
        principalId: 'employee-b',
        sessionGeneration: 1,
      }),
    );
    expect(first).not.toEqual(
      cmsPageQueryKey({
        ...publicContext,
        access: 'authenticated',
        principalId: 'employee-a',
        sessionGeneration: 2,
      }),
    );
  });

  it('rejects an authenticated key without session identity', () => {
    expect(() =>
      cmsPageQueryKey({ ...publicContext, access: 'authenticated' }),
    ).toThrow('principal and session generation');
  });
});
