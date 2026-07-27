import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearScreenLock,
  persistScreenLock,
  restoreScreenLock,
} from '../../src/auth/screenLockState';

describe('screen lock state', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('restores a bounded same-application return path without credentials', () => {
    persistScreenLock('/docs/framework');

    expect(restoreScreenLock()).toEqual({
      locked: true,
      returnPath: '/docs/framework',
    });
    expect(window.sessionStorage.getItem('nodics-axis-screen-lock-v1')).not.toContain(
      'token',
    );
  });

  it.each([
    'https://evil.example.com',
    '//evil.example.com',
    '/login',
    '/forgot-password',
    '/lock-screen',
    '/unsafe\\path',
  ])('replaces unsafe return path %s with the dashboard', (returnPath) => {
    persistScreenLock(returnPath);
    expect(restoreScreenLock()?.returnPath).toBe('/dashboard');
  });

  it('removes malformed state and clears state explicitly', () => {
    window.sessionStorage.setItem('nodics-axis-screen-lock-v1', '{bad');
    expect(restoreScreenLock()).toBeUndefined();
    expect(window.sessionStorage.getItem('nodics-axis-screen-lock-v1')).toBeNull();

    persistScreenLock('/assistant');
    clearScreenLock();
    expect(restoreScreenLock()).toBeUndefined();
  });
});
