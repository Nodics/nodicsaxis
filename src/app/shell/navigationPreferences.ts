const STORAGE_KEY = 'nodics-axis-navigation-preferences-v1';
const MAX_ITEMS = 12;

export interface NavigationPreferences {
  readonly favourites: readonly string[];
  readonly recents: readonly string[];
}

const emptyPreferences: NavigationPreferences = Object.freeze({
  favourites: Object.freeze([]),
  recents: Object.freeze([]),
});

function boundedKeys(value: unknown): readonly string[] {
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
    ].slice(0, MAX_ITEMS),
  );
}

export function navigationItemKey(moduleName: string, id: string): string {
  return `${moduleName}:${id}`;
}

export function loadNavigationPreferences(
  storage: Pick<Storage, 'getItem'> = window.localStorage,
): NavigationPreferences {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyPreferences;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return emptyPreferences;
    }
    const preferences = value as Record<string, unknown>;
    return Object.freeze({
      favourites: boundedKeys(preferences.favourites),
      recents: boundedKeys(preferences.recents),
    });
  } catch {
    return emptyPreferences;
  }
}

export function saveNavigationPreferences(
  preferences: NavigationPreferences,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void {
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      favourites: boundedKeys(preferences.favourites),
      recents: boundedKeys(preferences.recents),
    }),
  );
}

export function toggleNavigationFavourite(
  preferences: NavigationPreferences,
  key: string,
): NavigationPreferences {
  const favourites = preferences.favourites.includes(key)
    ? preferences.favourites.filter((item) => item !== key)
    : [key, ...preferences.favourites];
  return Object.freeze({
    favourites: boundedKeys(favourites),
    recents: preferences.recents,
  });
}

export function recordRecentNavigation(
  preferences: NavigationPreferences,
  key: string,
): NavigationPreferences {
  return Object.freeze({
    favourites: preferences.favourites,
    recents: boundedKeys([key, ...preferences.recents.filter((item) => item !== key)]),
  });
}
