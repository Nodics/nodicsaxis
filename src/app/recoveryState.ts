export type RecoveryKind =
  | 'configuration'
  | 'profile'
  | 'backoffice'
  | 'cms'
  | 'contract'
  | 'module'
  | 'unauthorized'
  | 'offline'
  | 'unexpected';

export interface RecoveryState {
  readonly kind: RecoveryKind;
  readonly detail?: string;
  readonly correlationId?: string;
  readonly retryable: boolean;
}

interface RecoveryContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly action: string;
}

const recoveryContent: Record<RecoveryKind, RecoveryContent> = {
  configuration: {
    eyebrow: 'Deployment configuration',
    title: 'Axis cannot start safely',
    description:
      'BackOffice deployment discovery and enterprise context must be valid before module discovery or authentication begins.',
    action: 'Retry configuration',
  },
  profile: {
    eyebrow: 'Identity service',
    title: 'Profile is unavailable',
    description:
      'Axis cannot authenticate people or validate their session while the Profile authority is unavailable.',
    action: 'Retry Profile',
  },
  backoffice: {
    eyebrow: 'Module discovery',
    title: 'BackOffice registry is unavailable',
    description:
      'The recovery workspace remains available, but Axis cannot discover authorized modules right now.',
    action: 'Retry discovery',
  },
  cms: {
    eyebrow: 'Content delivery',
    title: 'CMS content is unavailable',
    description:
      'Axis is using its static recovery experience because governed CMS presentation content could not be loaded.',
    action: 'Retry CMS',
  },
  contract: {
    eyebrow: 'Compatibility',
    title: 'This contract is not compatible',
    description:
      'The backend contract cannot be consumed safely by this Axis build. Upgrade or restore a supported contract.',
    action: 'Check again',
  },
  module: {
    eyebrow: 'Module capability',
    title: 'The requested module is unavailable',
    description:
      'Other authorized workspaces remain usable. This module can be retried when its observed service recovers.',
    action: 'Retry module',
  },
  unauthorized: {
    eyebrow: 'Access control',
    title: 'You do not have access',
    description:
      'The target module denied this operation. Axis cannot override backend permissions or tenant policy.',
    action: 'Return to workspace',
  },
  offline: {
    eyebrow: 'Network connection',
    title: 'Axis is offline',
    description:
      'Reconnect before continuing. Administrative data and mutations are not cached for offline execution.',
    action: 'Check connection',
  },
  unexpected: {
    eyebrow: 'Application recovery',
    title: 'This workspace could not be displayed',
    description:
      'Axis isolated an unexpected presentation failure. Other backend capabilities were not changed.',
    action: 'Retry workspace',
  },
};

export function getRecoveryContent(kind: RecoveryKind): RecoveryContent {
  return recoveryContent[kind];
}
