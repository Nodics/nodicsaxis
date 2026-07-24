export interface CmsPageQueryContext {
  readonly enterpriseCode: string;
  readonly tenantCode: string;
  readonly site: string;
  readonly path: string;
  readonly locale: string;
  readonly channel: string;
  readonly access: 'public' | 'authenticated';
  readonly principalId?: string | undefined;
  readonly sessionGeneration?: number | undefined;
}

export function cmsPageQueryKey(context: CmsPageQueryContext) {
  if (
    context.access === 'authenticated' &&
    (!context.principalId || !Number.isInteger(context.sessionGeneration))
  ) {
    throw new Error(
      'Authenticated CMS query keys require principal and session generation',
    );
  }

  return Object.freeze([
    'cms-page',
    context.enterpriseCode,
    context.tenantCode,
    context.site,
    context.path,
    context.locale,
    context.channel,
    context.access,
    context.principalId ?? 'anonymous',
    context.sessionGeneration ?? 0,
  ] as const);
}
