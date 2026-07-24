export type CmsRendererKind = 'page' | 'template' | 'component';

export interface CmsRendererManifestEntry {
  readonly kind: CmsRendererKind;
  readonly contractVersions: readonly number[];
}

export const CMS_RENDERER_MANIFEST = Object.freeze({
  'axis.page.authentication': {
    kind: 'page',
    contractVersions: Object.freeze([1]),
  },
  'axis.page.dashboard': {
    kind: 'page',
    contractVersions: Object.freeze([1]),
  },
  'axis.template.authentication': {
    kind: 'template',
    contractVersions: Object.freeze([1]),
  },
  'axis.template.dashboard': {
    kind: 'template',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.brand': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.message': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.authentication-showcase': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.employee-login-form': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.employee-recovery-form': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.employee-lock-form': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.link': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.dashboard-summary': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
  'axis.component.dashboard-actions': {
    kind: 'component',
    contractVersions: Object.freeze([1]),
  },
} satisfies Readonly<Record<string, CmsRendererManifestEntry>>);

export type CmsRendererKey = keyof typeof CMS_RENDERER_MANIFEST;

export function isRendererSupported(
  renderer: string,
  kind: CmsRendererKind,
  contractVersion: number,
): renderer is CmsRendererKey {
  const entry = (
    CMS_RENDERER_MANIFEST as Readonly<
      Record<string, CmsRendererManifestEntry | undefined>
    >
  )[renderer];
  return entry?.kind === kind && entry.contractVersions.includes(contractVersion);
}
