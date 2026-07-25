export interface AxisPublicBootstrap {
  readonly contractVersion: number;
  readonly clientContractVersion: number;
  readonly endpoints: {
    readonly profile: string;
    readonly cms: string;
  };
  readonly uiComposition: {
    readonly site: string;
    readonly catalog: string;
    readonly defaultPublicPage: string;
    readonly defaultAuthenticatedPage: string;
    readonly locale: string;
    readonly channel: string;
    readonly fallbackMode: 'STATIC_RECOVERY_SHELL';
  };
}

export interface AxisEmployeePolicy {
  readonly contractVersion: number;
  readonly screenLockEnabled: boolean;
  readonly idleTimeoutSeconds: number;
  readonly revision: number;
  readonly source: 'DEFAULT' | 'PERSISTED';
}

export type AxisModuleAvailability = 'UP' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';
export type AxisNavigationFeatureState = 'ACTIVE' | 'PREVIEW' | 'DISABLED' | 'HIDDEN';

export interface AxisNavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly labelKey?: string | undefined;
  readonly order: number;
}

export interface AxisNavigationBadgeProvider {
  readonly moduleName: string;
  readonly operationId: string;
}

export interface AxisNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly order: number;
  readonly moduleName: string;
  readonly category: string;
  readonly icon: string;
  readonly availability: AxisModuleAvailability;
  readonly labelKey?: string | undefined;
  readonly parentId?: string | undefined;
  readonly group?: AxisNavigationGroup | undefined;
  readonly perspectives?: readonly string[] | undefined;
  readonly contexts?: readonly string[] | undefined;
  readonly featureState?: AxisNavigationFeatureState | undefined;
  readonly badgeProvider?: AxisNavigationBadgeProvider | undefined;
}

export interface AxisModuleConnection {
  readonly moduleName: string;
  readonly instanceId: string;
  readonly endpoint: string;
  readonly environment: string;
  readonly state: AxisModuleAvailability;
}

export interface AxisAuthenticatedBootstrap {
  readonly axisPolicy: AxisEmployeePolicy;
  readonly navigation: readonly AxisNavigationItem[];
  readonly environments: readonly string[];
  readonly moduleConnections: Readonly<Record<string, readonly AxisModuleConnection[]>>;
  readonly tenantCode: string;
}

export function selectModuleConnection(
  bootstrap: AxisAuthenticatedBootstrap,
  moduleName: string,
): AxisModuleConnection | undefined {
  const connections = bootstrap.moduleConnections[moduleName] ?? [];
  return (
    connections.find((connection) => connection.state === 'UP') ??
    connections.find((connection) => connection.state === 'DEGRADED')
  );
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
}

function baseUrl(value: unknown, name: string): string {
  const parsed = new URL(text(value, name));
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(`${name} must be a safe HTTP endpoint`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function nonNegativeInteger(value: unknown, name: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return Number(value);
}

function stringList(value: unknown, name: string): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    throw new Error(`${name} must be a list of non-empty strings`);
  }
  return Object.freeze([...new Set(value as string[])]);
}

function relativeRoute(value: unknown, name: string): string {
  const route = text(value, name);
  if (!route.startsWith('/') || route.startsWith('//')) {
    throw new Error(`${name} must be an application-relative route`);
  }
  return route;
}

function availabilityState(value: unknown): AxisModuleAvailability {
  return ['UP', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN'].includes(String(value))
    ? (value as AxisModuleAvailability)
    : 'UNKNOWN';
}

function optionalText(value: unknown, name: string): string | undefined {
  return value === undefined ? undefined : text(value, name);
}

function navigationFeatureState(value: unknown): AxisNavigationFeatureState {
  if (value === undefined) return 'ACTIVE';
  if (
    typeof value !== 'string' ||
    !['ACTIVE', 'PREVIEW', 'DISABLED', 'HIDDEN'].includes(value)
  ) {
    throw new Error('BackOffice navigation feature state is unsupported');
  }
  return value as AxisNavigationFeatureState;
}

function parseNavigationGroup(
  value: unknown,
  moduleName: string,
): AxisNavigationGroup | undefined {
  if (value === undefined) return undefined;
  const group = record(value, `${moduleName} navigation group`);
  return Object.freeze({
    id: text(group.id, `${moduleName} navigation group id`),
    label: text(group.label, `${moduleName} navigation group label`),
    labelKey: optionalText(group.labelKey, `${moduleName} navigation group label key`),
    order: Number.isInteger(group.order) ? Number(group.order) : 0,
  });
}

function parseBadgeProvider(
  value: unknown,
  moduleName: string,
): AxisNavigationBadgeProvider | undefined {
  if (value === undefined) return undefined;
  const provider = record(value, `${moduleName} navigation badge provider`);
  return Object.freeze({
    moduleName: text(
      provider.moduleName,
      `${moduleName} navigation badge provider module`,
    ),
    operationId: text(
      provider.operationId,
      `${moduleName} navigation badge provider operation`,
    ),
  });
}

function parseNavigation(
  catalogueValue: unknown,
  availabilityValue: unknown,
): readonly AxisNavigationItem[] {
  const catalogue = record(catalogueValue, 'BackOffice module catalogue');
  const availability = record(availabilityValue, 'BackOffice module availability');
  const navigation: AxisNavigationItem[] = [];

  Object.entries(catalogue).forEach(([moduleName, rawMetadata]) => {
    const metadata = record(rawMetadata, `BackOffice catalogue entry ${moduleName}`);
    if (metadata.enabled === false) return;
    const compatibility = record(metadata.compatibility, `${moduleName} compatibility`);
    if (compatibility.status === 'INCOMPATIBLE') return;
    if (metadata.requiredPermissions !== undefined) {
      stringList(metadata.requiredPermissions, `${moduleName} required permissions`);
    }
    if (!Array.isArray(metadata.navigation)) return;
    const moduleAvailability =
      availability[moduleName] === undefined
        ? 'UNKNOWN'
        : availabilityState(
            record(availability[moduleName], `${moduleName} availability`).state,
          );

    metadata.navigation.forEach((rawItem, index) => {
      const item = record(rawItem, `${moduleName} navigation item`);
      if (item.requiredPermissions !== undefined) {
        stringList(item.requiredPermissions, `${moduleName} navigation permissions`);
      }
      navigation.push(
        Object.freeze({
          id: text(item.id, `${moduleName} navigation id`),
          label: text(item.label, `${moduleName} navigation label`),
          route: relativeRoute(item.route, `${moduleName} navigation route`),
          order: Number.isInteger(item.order) ? Number(item.order) : index,
          moduleName,
          category:
            typeof metadata.category === 'string' && metadata.category !== ''
              ? metadata.category
              : 'other',
          icon:
            typeof item.icon === 'string' && item.icon !== ''
              ? item.icon
              : typeof metadata.icon === 'string' && metadata.icon !== ''
                ? metadata.icon
                : 'module',
          availability: moduleAvailability,
          labelKey: optionalText(item.labelKey, `${moduleName} navigation label key`),
          parentId: optionalText(item.parentId, `${moduleName} navigation parent id`),
          group: parseNavigationGroup(item.group, moduleName),
          perspectives:
            item.perspectives === undefined
              ? Object.freeze(['operations'])
              : stringList(item.perspectives, `${moduleName} navigation perspectives`),
          contexts:
            item.contexts === undefined
              ? Object.freeze([])
              : stringList(item.contexts, `${moduleName} navigation contexts`),
          featureState: navigationFeatureState(item.featureState),
          badgeProvider: parseBadgeProvider(item.badgeProvider, moduleName),
        }),
      );
    });
  });

  const byModule = new Map<string, AxisNavigationItem[]>();
  navigation.forEach((item) => {
    byModule.set(item.moduleName, [...(byModule.get(item.moduleName) ?? []), item]);
  });
  byModule.forEach((items, moduleName) => {
    const byId = new Map(items.map((item) => [item.id, item]));
    if (byId.size !== items.length) {
      throw new Error(`${moduleName} navigation contains duplicate ids`);
    }
    items.forEach((item) => {
      const visited = new Set([item.id]);
      let parentId = item.parentId;
      while (parentId) {
        const parent = byId.get(parentId);
        if (!parent) {
          throw new Error(`${moduleName} navigation contains an orphan item`);
        }
        if (visited.has(parentId)) {
          throw new Error(`${moduleName} navigation contains a cycle`);
        }
        visited.add(parentId);
        parentId = parent.parentId;
      }
    });
  });

  return Object.freeze(
    navigation.sort(
      (left, right) =>
        left.order - right.order || left.label.localeCompare(right.label),
    ),
  );
}

function parseModuleContext(modulesValue: unknown): {
  readonly environments: readonly string[];
  readonly connections: Readonly<Record<string, readonly AxisModuleConnection[]>>;
} {
  const modules = record(modulesValue, 'BackOffice authorized modules');
  const environments: string[] = [];
  const connections: Record<string, readonly AxisModuleConnection[]> = {};
  Object.entries(modules).forEach(([moduleName, instances]) => {
    if (!Array.isArray(instances)) {
      throw new Error('BackOffice module instances must be a list');
    }
    const moduleConnections: AxisModuleConnection[] = [];
    instances.forEach((instance) => {
      const lease = record(instance, 'BackOffice module lease');
      const environment =
        typeof lease.environment === 'string' && lease.environment !== ''
          ? lease.environment
          : undefined;
      if (environment) environments.push(environment);
      if (
        lease.clientCallable === true &&
        lease.endpoint !== undefined &&
        environment
      ) {
        moduleConnections.push(
          Object.freeze({
            moduleName,
            instanceId: text(lease.instanceId, `${moduleName} instanceId`),
            endpoint: baseUrl(lease.endpoint, `${moduleName} endpoint`),
            environment,
            state: availabilityState(lease.state),
          }),
        );
      }
    });
    if (moduleConnections.length > 0) {
      connections[moduleName] = Object.freeze(
        moduleConnections.sort((left, right) =>
          left.instanceId.localeCompare(right.instanceId),
        ),
      );
    }
  });
  return Object.freeze({
    environments: Object.freeze([...new Set(environments)].sort()),
    connections: Object.freeze({ ...connections }),
  });
}

export function parseEmployeePolicy(value: unknown): AxisEmployeePolicy {
  const policy = record(value, 'BackOffice Axis employee policy');
  if (
    policy.contractVersion !== 1 ||
    typeof policy.screenLockEnabled !== 'boolean' ||
    !Number.isInteger(policy.idleTimeoutSeconds) ||
    Number(policy.idleTimeoutSeconds) < 60 ||
    Number(policy.idleTimeoutSeconds) > 86_400 ||
    !['DEFAULT', 'PERSISTED'].includes(String(policy.source))
  ) {
    throw new Error('BackOffice Axis employee policy is incompatible');
  }
  return Object.freeze({
    contractVersion: 1,
    screenLockEnabled: policy.screenLockEnabled,
    idleTimeoutSeconds: Number(policy.idleTimeoutSeconds),
    revision: nonNegativeInteger(policy.revision, 'Axis policy revision'),
    source: policy.source as 'DEFAULT' | 'PERSISTED',
  });
}

export function parsePublicBootstrap(
  value: unknown,
  expectedVersion: number,
): AxisPublicBootstrap {
  const envelope = record(value, 'BackOffice public bootstrap response');
  const data = record(envelope.data, 'BackOffice public bootstrap data');
  if (
    data.contractVersion !== expectedVersion ||
    data.clientContractVersion !== expectedVersion
  ) {
    throw new Error('BackOffice public bootstrap contract is incompatible');
  }
  const endpoints = record(data.endpoints, 'public bootstrap endpoints');
  const composition = record(data.uiComposition, 'public bootstrap composition');
  if (composition.fallbackMode !== 'STATIC_RECOVERY_SHELL') {
    throw new Error('BackOffice public bootstrap fallback mode is unsupported');
  }
  return Object.freeze({
    contractVersion: expectedVersion,
    clientContractVersion: expectedVersion,
    endpoints: Object.freeze({
      profile: baseUrl(endpoints.profile, 'profile endpoint'),
      cms: baseUrl(endpoints.cms, 'cms endpoint'),
    }),
    uiComposition: Object.freeze({
      site: text(composition.site, 'composition site'),
      catalog: text(composition.catalog, 'composition catalog'),
      defaultPublicPage: text(composition.defaultPublicPage, 'default public page'),
      defaultAuthenticatedPage: text(
        composition.defaultAuthenticatedPage,
        'default authenticated page',
      ),
      locale: text(composition.locale, 'composition locale'),
      channel: text(composition.channel, 'composition channel'),
      fallbackMode: 'STATIC_RECOVERY_SHELL',
    }),
  });
}

export async function loadPublicBootstrap(
  backofficeBaseUrl: string,
  clientContractVersion: number,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<AxisPublicBootstrap> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL('/nodics/backoffice/v0/bootstrap/public', backofficeBaseUrl);
    const response = await fetchImplementation(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-nodics-client-contract-version': String(clientContractVersion),
      },
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(
        `BackOffice public bootstrap returned HTTP ${String(response.status)}`,
      );
    }
    return parsePublicBootstrap(await response.json(), clientContractVersion);
  } catch (error: unknown) {
    if (controller.signal.aborted) {
      throw new Error('BackOffice public bootstrap timed out');
    }
    throw error instanceof Error
      ? error
      : new Error('BackOffice public bootstrap failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function loadAuthenticatedBootstrap(
  backofficeBaseUrl: string,
  clientContractVersion: number,
  accessToken: string,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<AxisAuthenticatedBootstrap> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImplementation(
      new URL('/nodics/backoffice/v0/bootstrap', backofficeBaseUrl),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-nodics-client-contract-version': String(clientContractVersion),
        },
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? 'This employee is not authorized to use Nodics Axis.'
          : `BackOffice employee bootstrap returned HTTP ${String(response.status)}`,
      );
    }
    const envelope = record(
      await response.json(),
      'BackOffice employee bootstrap response',
    );
    const data = record(envelope.data, 'BackOffice employee bootstrap data');
    const moduleContext = parseModuleContext(data.modules);
    return Object.freeze({
      axisPolicy: parseEmployeePolicy(data.axisPolicy),
      navigation: parseNavigation(data.catalogue, data.availability),
      environments: moduleContext.environments,
      moduleConnections: moduleContext.connections,
      tenantCode: text(data.tenantCode, 'BackOffice employee tenant code'),
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
