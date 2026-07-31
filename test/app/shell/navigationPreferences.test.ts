import { describe, expect, it } from 'vitest';

import {
  loadNavigationPreferences,
  navigationItemKey,
  recordRecentNavigation,
  saveNavigationPreferences,
  toggleNavigationFavourite,
} from '../../../src/app/shell/navigationPreferences';

describe('Axis navigation preferences', () => {
  it('stores only bounded stable module and item identifiers', () => {
    let saved = '';
    const storage = {
      getItem: () => saved,
      setItem: (_key: string, value: string) => {
        saved = value;
      },
    };
    let preferences = loadNavigationPreferences(storage);
    const key = navigationItemKey('cms', 'content');
    preferences = toggleNavigationFavourite(preferences, key);
    preferences = recordRecentNavigation(preferences, key);
    saveNavigationPreferences(preferences, storage);

    expect(loadNavigationPreferences(storage)).toEqual({
      favourites: ['cms:content'],
      recents: ['cms:content'],
    });
    expect(saved).not.toContain('/content');
  });

  it('fails closed for malformed or sensitive-looking persisted values', () => {
    const preferences = loadNavigationPreferences({
      getItem: () =>
        JSON.stringify({
          favourites: ['cms:content', 'token=secret', '/content'],
          recents: {},
        }),
    });
    expect(preferences).toEqual({
      favourites: ['cms:content'],
      recents: [],
    });
  });

  it('applies the configured recent item limit', () => {
    let preferences = loadNavigationPreferences(
      {
        getItem: () =>
          JSON.stringify({
            favourites: [],
            recents: ['cms:content', 'media:media', 'profile:tenant'],
          }),
      },
      { recentItems: 2 },
    );

    expect(preferences.recents).toEqual(['cms:content', 'media:media']);

    preferences = recordRecentNavigation(preferences, 'export:history', {
      recentItems: 2,
    });

    expect(preferences.recents).toEqual(['export:history', 'cms:content']);
  });
});
