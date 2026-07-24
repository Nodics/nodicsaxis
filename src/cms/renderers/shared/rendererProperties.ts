import type { CmsComponentContract } from '../../cmsContract';

export function stringProperty(
  component: CmsComponentContract,
  name: string,
  fallback = '',
): string {
  const value = component.properties[name];
  if (value === undefined) return fallback;
  if (typeof value !== 'string') {
    throw new Error(`${component.code}.${name} must be a string`);
  }
  return value;
}

export function booleanProperty(
  component: CmsComponentContract,
  name: string,
): boolean {
  const value = component.properties[name];
  if (value === undefined) return false;
  if (typeof value !== 'boolean') {
    throw new Error(`${component.code}.${name} must be a boolean`);
  }
  return value;
}

export function arrayProperty(
  component: CmsComponentContract,
  name: string,
): readonly unknown[] {
  const value = component.properties[name];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${component.code}.${name} must be an array`);
  }
  return value;
}
