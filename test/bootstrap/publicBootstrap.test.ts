import { describe, expect, it, vi } from 'vitest';

import {
  loadAuthenticatedBootstrap,
  loadPublicBootstrap,
  selectModuleConnection,
} from '../../src/bootstrap/publicBootstrap';

const document = {
  code: 'SUC_BOF_00014',
  data: {
    contractVersion: 1,
    clientContractVersion: 1,
    endpoints: {
      profile: 'https://profile.example.com',
      cms: 'https://cms.example.com',
    },
    uiComposition: {
      site: 'axisCmsSite',
      catalog: 'axisContentCatalog',
      defaultPublicPage: '/login',
      defaultAuthenticatedPage: '/dashboard',
      locale: 'en',
      channel: 'web',
      fallbackMode: 'STATIC_RECOVERY_SHELL',
    },
  },
};

const authenticatedData = {
  modules: {
    gContent: [
      {
        moduleName: 'gContent',
        displayName: 'Content',
        canonicalIdentity: 'nodics/gContent',
        instanceId: 'runtime-0',
        clientCallable: false,
        moduleKind: 'group',
      },
    ],
    cms: [
      {
        moduleName: 'cms',
        displayName: 'Content Management',
        parentModule: 'gContent',
        canonicalIdentity: 'nodics/gContent/cms',
        instanceId: 'runtime-1',
        environment: 'startioLocal',
        clientCallable: true,
        endpoint: 'https://cms.example.com/nodics/cms',
        state: 'UP',
        moduleKind: 'capability',
      },
    ],
  },
  catalogue: {
    cms: {
      enabled: true,
      category: 'content',
      icon: 'content',
      requiredPermissions: ['cms.backoffice.view'],
      compatibility: { status: 'COMPATIBLE' },
      navigation: [
        {
          id: 'cms',
          label: 'Content',
          route: '/content',
          icon: 'cms',
          order: 200,
          labelKey: 'axis.navigation.content',
          group: {
            id: 'content',
            label: 'Content and Experience',
            labelKey: 'axis.group.content',
            order: 200,
          },
          perspectives: ['operations', 'content'],
          contexts: ['environment', 'tenant', 'site', 'catalog'],
          featureState: 'PREVIEW',
          badgeProvider: {
            moduleName: 'cms',
            operationId: 'cms.pending.count',
          },
          requiredPermissions: ['cms.backoffice.view'],
        },
      ],
    },
  },
  availability: {
    cms: { state: 'UP' },
  },
  documentationSources: [
    {
      id: 'framework',
      label: 'Framework',
      type: 'CMS',
      route: '/docs/framework',
      order: 100,
      ownerModule: 'backoffice',
      connectionModule: 'cms',
      site: 'axisCmsSite',
      catalog: 'nodicsDocumentationContentCatalog',
      defaultPage: '/docs',
      packCode: 'nodicsDocumentation',
    },
  ],
  axisPolicy: {
    contractVersion: 1,
    screenLockEnabled: true,
    idleTimeoutSeconds: 900,
    revision: 0,
    source: 'DEFAULT',
  },
  tenantCode: 'default',
};

describe('Axis bootstrap clients', () => {
  it('accepts only the low-disclosure compatible public contract', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(document), { status: 200 }));
    const result = await loadPublicBootstrap(
      'https://backoffice.example.com',
      1,
      10_000,
      request,
    );
    expect(result.endpoints.cms).toBe('https://cms.example.com');
    const [url, options] = request.mock.calls[0] ?? [];
    expect(url instanceof URL ? url.pathname : '').toBe(
      '/nodics/backoffice/v0/bootstrap/public',
    );
    expect(new Headers(options?.headers).get('Authorization')).toBeNull();
  });

  it('rejects incompatible public contracts', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...document,
          data: { ...document.data, contractVersion: 2 },
        }),
        { status: 200 },
      ),
    );
    await expect(
      loadPublicBootstrap('https://backoffice.example.com', 1, 10_000, request),
    ).rejects.toThrow(/incompatible/i);
  });

  it('uses the employee bearer only for the secured bootstrap', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: authenticatedData,
        }),
        { status: 200 },
      ),
    );
    const result = await loadAuthenticatedBootstrap(
      'https://backoffice.example.com',
      1,
      'employee-access',
      10_000,
      request,
    );
    const [, options] = request.mock.calls[0] ?? [];
    expect(new Headers(options?.headers).get('Authorization')).toBe(
      'Bearer employee-access',
    );
    expect(result.axisPolicy.idleTimeoutSeconds).toBe(900);
    expect(result.environments).toEqual(['startioLocal']);
    expect(result.tenantCode).toBe('default');
    expect(result.moduleCatalog.cms).toEqual({
      moduleName: 'cms',
      displayName: 'Content Management',
      parentModule: 'gContent',
      canonicalIdentity: 'nodics/gContent/cms',
      moduleKind: 'capability',
    });
    expect(result.moduleCatalog.gContent).toEqual({
      moduleName: 'gContent',
      displayName: 'Content',
      canonicalIdentity: 'nodics/gContent',
      moduleKind: 'group',
    });
    expect(result.documentationSources).toEqual([
      expect.objectContaining({
        id: 'framework',
        type: 'CMS',
        site: 'axisCmsSite',
        packCode: 'nodicsDocumentation',
      }),
    ]);
    expect(result.moduleConnections.cms).toEqual([
      {
        moduleName: 'cms',
        instanceId: 'runtime-1',
        endpoint: 'https://cms.example.com/nodics/cms',
        environment: 'startioLocal',
        state: 'UP',
      },
    ]);
    expect(selectModuleConnection(result, 'cms')?.endpoint).toBe(
      'https://cms.example.com/nodics/cms',
    );
    expect(result.navigation).toEqual([
      expect.objectContaining({
        label: 'Content',
        moduleName: 'cms',
        icon: 'cms',
        availability: 'UP',
        labelKey: 'axis.navigation.content',
        group: {
          id: 'content',
          label: 'Content and Experience',
          labelKey: 'axis.group.content',
          order: 200,
        },
        perspectives: ['operations', 'content'],
        contexts: ['environment', 'tenant', 'site', 'catalog'],
        featureState: 'PREVIEW',
        badgeProvider: {
          moduleName: 'cms',
          operationId: 'cms.pending.count',
        },
      }),
    ]);
  });

  it('rejects unsafe direct-module connection settings', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ...authenticatedData,
            modules: {
              cms: [
                {
                  moduleName: 'cms',
                  instanceId: 'unsafe',
                  environment: 'startioLocal',
                  clientCallable: true,
                  endpoint: 'https://user:secret@cms.example.com/nodics/cms',
                  state: 'UP',
                },
              ],
            },
          },
        }),
        { status: 200 },
      ),
    );
    await expect(
      loadAuthenticatedBootstrap(
        'https://backoffice.example.com',
        1,
        'employee-access',
        10_000,
        request,
      ),
    ).rejects.toThrow(/safe HTTP endpoint/);
  });

  it('accepts navigation that the authoritative bootstrap already permission-filtered', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ...authenticatedData,
            catalogue: {
              cms: {
                ...authenticatedData.catalogue.cms,
                navigation: [
                  {
                    id: 'admin',
                    label: 'CMS administration',
                    route: '/content/admin',
                    requiredPermissions: ['cms.administration.manage'],
                  },
                ],
              },
            },
          },
        }),
        { status: 200 },
      ),
    );
    const result = await loadAuthenticatedBootstrap(
      'https://backoffice.example.com',
      1,
      'employee-access',
      10_000,
      request,
    );
    expect(result.navigation).toEqual([
      expect.objectContaining({
        id: 'admin',
        route: '/content/admin',
      }),
    ]);
  });

  it('rejects orphaned and cyclic navigation even when backend validation is bypassed', async () => {
    for (const navigation of [
      [{ id: 'child', label: 'Child', route: '/child', parentId: 'missing' }],
      [
        { id: 'one', label: 'One', route: '/one', parentId: 'two' },
        { id: 'two', label: 'Two', route: '/two', parentId: 'one' },
      ],
    ]) {
      const request = vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              ...authenticatedData,
              catalogue: {
                cms: {
                  ...authenticatedData.catalogue.cms,
                  navigation,
                },
              },
            },
          }),
          { status: 200 },
        ),
      );
      await expect(
        loadAuthenticatedBootstrap(
          'https://backoffice.example.com',
          1,
          'employee-access',
          10_000,
          request,
        ),
      ).rejects.toThrow(/orphan|cycle/iu);
    }
  });

  it('rejects unsafe or incompatible employee idle policies', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            ...authenticatedData,
            axisPolicy: {
              contractVersion: 1,
              screenLockEnabled: true,
              idleTimeoutSeconds: 30,
              revision: 0,
              source: 'DEFAULT',
            },
          },
        }),
        { status: 200 },
      ),
    );
    await expect(
      loadAuthenticatedBootstrap(
        'https://backoffice.example.com',
        1,
        'employee-access',
        10_000,
        request,
      ),
    ).rejects.toThrow(/policy is incompatible/i);
  });
});
