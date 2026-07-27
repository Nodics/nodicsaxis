import type { AxisModuleAvailability } from '../../../bootstrap/publicBootstrap';

export type ModuleHealthFreshness = 'FRESH' | 'STALE' | 'MISSING';

export interface ModuleHealthSummary {
  readonly moduleName: string;
  readonly displayName?: string | undefined;
  readonly parentModule?: string | undefined;
  readonly canonicalIdentity?: string | undefined;
  readonly version?: string | undefined;
  readonly moduleKind?: string | undefined;
  readonly environments: readonly string[];
  readonly servers: readonly string[];
  readonly availability: {
    readonly state: AxisModuleAvailability;
    readonly activeInstances: number;
    readonly healthyInstances: number;
    readonly unavailableInstances: number;
    readonly unknownInstances: number;
  };
}

export interface ModuleHealthInstance {
  readonly instanceId: string;
  readonly clientCallable: boolean;
  readonly environment?: string | undefined;
  readonly server?: string | undefined;
  readonly node?: string | undefined;
  readonly version?: string | undefined;
  readonly lastSeenAt: string;
  readonly availability: {
    readonly state: 'UP' | 'UNAVAILABLE' | 'UNKNOWN';
    readonly freshness: ModuleHealthFreshness;
    readonly observedAt?: string | undefined;
    readonly reasonCode?: string | undefined;
  };
}

export interface ModuleHealthDetail {
  readonly moduleName: string;
  readonly displayName?: string | undefined;
  readonly availability: ModuleHealthSummary['availability'];
  readonly instances: readonly ModuleHealthInstance[];
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

function optionalText(value: unknown, name: string): string | undefined {
  return value === undefined || value === null ? undefined : text(value, name);
}

function integer(value: unknown, name: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return Number(value);
}

function stringList(value: unknown, name: string): readonly string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${name} must be a string list`);
  }
  return Object.freeze([...new Set(value as string[])]);
}

function moduleState(value: unknown): AxisModuleAvailability {
  if (!['UP', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN'].includes(String(value))) {
    throw new Error('Module availability state is unsupported');
  }
  return value as AxisModuleAvailability;
}

function instanceState(value: unknown): 'UP' | 'UNAVAILABLE' | 'UNKNOWN' {
  if (!['UP', 'UNAVAILABLE', 'UNKNOWN'].includes(String(value))) {
    throw new Error('Runtime instance state is unsupported');
  }
  return value as 'UP' | 'UNAVAILABLE' | 'UNKNOWN';
}

function freshness(value: unknown): ModuleHealthFreshness {
  if (!['FRESH', 'STALE', 'MISSING'].includes(String(value))) {
    throw new Error('Runtime observation freshness is unsupported');
  }
  return value as ModuleHealthFreshness;
}

function parseAvailability(
  value: unknown,
  name: string,
): ModuleHealthSummary['availability'] {
  const availability = record(value, name);
  return Object.freeze({
    state: moduleState(availability.state),
    activeInstances: integer(availability.activeInstances, `${name} active instances`),
    healthyInstances: integer(
      availability.healthyInstances,
      `${name} healthy instances`,
    ),
    unavailableInstances: integer(
      availability.unavailableInstances,
      `${name} unavailable instances`,
    ),
    unknownInstances: integer(
      availability.unknownInstances,
      `${name} unknown instances`,
    ),
  });
}

export function parseModuleHealthList(value: unknown): readonly ModuleHealthSummary[] {
  const data = record(value, 'Module health list');
  if (!Array.isArray(data.items)) throw new Error('Module health items must be a list');
  return Object.freeze(
    data.items.map((itemValue) => {
      const item = record(itemValue, 'Module health item');
      const moduleName = text(item.moduleName, 'Module health module name');
      return Object.freeze({
        moduleName,
        displayName: optionalText(item.displayName, `${moduleName} display name`),
        parentModule: optionalText(item.parentModule, `${moduleName} parent module`),
        canonicalIdentity: optionalText(
          item.canonicalIdentity,
          `${moduleName} canonical identity`,
        ),
        version: optionalText(item.version, `${moduleName} version`),
        moduleKind: optionalText(item.moduleKind, `${moduleName} kind`),
        environments: stringList(item.environments, `${moduleName} environments`),
        servers: stringList(item.servers, `${moduleName} servers`),
        availability: parseAvailability(
          item.availability,
          `${moduleName} availability`,
        ),
      });
    }),
  );
}

export function parseModuleHealthDetail(value: unknown): ModuleHealthDetail {
  const data = record(value, 'Module health detail');
  const moduleName = text(data.moduleName, 'Module health detail module name');
  if (!Array.isArray(data.instances)) {
    throw new Error('Module health instances must be a list');
  }
  return Object.freeze({
    moduleName,
    displayName: optionalText(data.displayName, `${moduleName} display name`),
    availability: parseAvailability(data.availability, `${moduleName} availability`),
    instances: Object.freeze(
      data.instances.map((instanceValue) => {
        const instance = record(instanceValue, `${moduleName} runtime instance`);
        const observation = record(
          instance.availability,
          `${moduleName} runtime availability`,
        );
        return Object.freeze({
          instanceId: text(instance.instanceId, `${moduleName} runtime instance id`),
          clientCallable: instance.clientCallable === true,
          environment: optionalText(instance.environment, `${moduleName} environment`),
          server: optionalText(instance.server, `${moduleName} server`),
          node: optionalText(instance.node, `${moduleName} node`),
          version: optionalText(instance.version, `${moduleName} version`),
          lastSeenAt: text(instance.lastSeenAt, `${moduleName} last heartbeat`),
          availability: Object.freeze({
            state: instanceState(observation.state),
            freshness: freshness(observation.freshness),
            observedAt: optionalText(
              observation.observedAt,
              `${moduleName} observed time`,
            ),
            reasonCode: optionalText(
              observation.reasonCode,
              `${moduleName} readiness reason`,
            ),
          }),
        });
      }),
    ),
  });
}
