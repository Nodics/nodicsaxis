const STORAGE_KEY = 'nodics-axis-navigation-preferences-v1';
const DEFAULT_MAX_ITEMS = 12;
const MIN_ITEMS = 1;
const MAX_ITEMS = 24;

export interface NavigationPreferences {
  readonly favourites: readonly string[];
  readonly recents: readonly string[];
}

export interface NavigationPreferenceLimits {
  readonly favouriteItems?: number | undefined;
  readonly recentItems?: number | undefined;
}

const emptyPreferences: NavigationPreferences = Object.freeze({
  favourites: Object.freeze([]),
  recents: Object.freeze([]),
});

function boundedLimit(value: number | undefined): number {
  if (!Number.isInteger(value)) return DEFAULT_MAX_ITEMS;
  return Math.min(Math.max(Number(value), MIN_ITEMS), MAX_ITEMS);
}

function boundedKeys(value: unknown, limit: number): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    [
      ...new Set(
        value.filter(
          (item): item is string =>
            typeof item === 'string' &&
            /^[A-Za-z][A-Za-z0-9_-]{0,127}:[A-Za-z][A-Za-z0-9_-]{0,127}$/u.test(item),
        ),
      ),
    ].slice(0, limit),
  );
}

export function navigationItemKey(moduleName: string, id: string): string {
  return `${moduleName}:${id}`;
}

export function loadNavigationPreferences(
  storage: Pick<Storage, 'getItem'> = window.localStorage,
  limits: NavigationPreferenceLimits = {},
): NavigationPreferences {
  const favouriteLimit = boundedLimit(limits.favouriteItems);
  const recentLimit = boundedLimit(limits.recentItems);
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyPreferences;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return emptyPreferences;
    }
    const preferences = value as Record<string, unknown>;
    return Object.freeze({
      favourites: boundedKeys(preferences.favourites, favouriteLimit),
      recents: boundedKeys(preferences.recents, recentLimit),
    });
  } catch {
    return emptyPreferences;
  }
}

export function saveNavigationPreferences(
  preferences: NavigationPreferences,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
  limits: NavigationPreferenceLimits = {},
): void {
  const favouriteLimit = boundedLimit(limits.favouriteItems);
  const recentLimit = boundedLimit(limits.recentItems);
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      favourites: boundedKeys(preferences.favourites, favouriteLimit),
      recents: boundedKeys(preferences.recents, recentLimit),
    }),
  );
}

export function toggleNavigationFavourite(
  preferences: NavigationPreferences,
  key: string,
  limits: NavigationPreferenceLimits = {},
): NavigationPreferences {
  const favouriteLimit = boundedLimit(limits.favouriteItems);
  const favourites = preferences.favourites.includes(key)
    ? preferences.favourites.filter((item) => item !== key)
    : [key, ...preferences.favourites];
  return Object.freeze({
    favourites: boundedKeys(favourites, favouriteLimit),
    recents: preferences.recents,
  });
}

export function recordRecentNavigation(
  preferences: NavigationPreferences,
  key: string,
  limits: NavigationPreferenceLimits = {},
): NavigationPreferences {
  const recentLimit = boundedLimit(limits.recentItems);
  return Object.freeze({
    favourites: preferences.favourites,
    recents: boundedKeys(
      [key, ...preferences.recents.filter((item) => item !== key)],
      recentLimit,
    ),
  });
}
