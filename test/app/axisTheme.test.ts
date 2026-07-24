import { describe, expect, it } from 'vitest';

import { axisTokens, createAxisTheme } from '../../src/app/axisTheme';

describe('Axis typography theme', () => {
  it('uses one shared font stack and accessible body sizing', () => {
    const theme = createAxisTheme('light', 'comfortable');

    expect(theme.typography.fontFamily).toBe(axisTokens.typography.fontFamily);
    expect(theme.typography.body1.fontSize).toBe('0.9375rem');
    expect(theme.typography.body1.lineHeight).toBe(1.6);
    expect(theme.typography.body2.fontSize).toBe('0.8125rem');
  });

  it('keeps heading hierarchy compact enough for an enterprise workspace', () => {
    const theme = createAxisTheme('light', 'compact');

    expect(theme.typography.h1.fontSize).toBe('clamp(2rem, 2.5vw, 2.5rem)');
    expect(theme.typography.h3.fontSize).toBe('clamp(1.375rem, 1.5vw, 1.625rem)');
    expect(theme.typography.h6.fontSize).toBe('1rem');
  });

  it('keeps density independent from readable type sizes', () => {
    const comfortable = createAxisTheme('dark', 'comfortable');
    const compact = createAxisTheme('dark', 'compact');

    expect(compact.typography.body1).toEqual(comfortable.typography.body1);
    expect(compact.typography.button).toEqual(comfortable.typography.button);
  });
});

describe('Axis color theme', () => {
  it('uses the approved signature gold in both color modes', () => {
    const light = createAxisTheme('light', 'comfortable');
    const dark = createAxisTheme('dark', 'comfortable');

    expect(light.palette.primary.main).toBe('#f5c400');
    expect(dark.palette.primary.main).toBe('#f5c400');
    expect(light.palette.primary.contrastText).toBe('#25292c');
  });

  it('gives light and dark workspaces distinct governed surfaces', () => {
    const light = createAxisTheme('light', 'comfortable');
    const dark = createAxisTheme('dark', 'comfortable');

    expect(light.palette.background.default).toBe('#f4f6f8');
    expect(light.palette.background.paper).toBe('#ffffff');
    expect(dark.palette.background.default).toBe('#171a1d');
    expect(dark.palette.background.paper).toBe('#202428');
    expect(light.palette.divider).not.toBe(dark.palette.divider);
  });
});

describe('Axis spacing and surface theme', () => {
  it('uses a stable eight pixel layout grid at both densities', () => {
    const comfortable = createAxisTheme('light', 'comfortable');
    const compact = createAxisTheme('light', 'compact');

    expect(comfortable.spacing(1)).toContain('8px');
    expect(compact.spacing(1)).toContain('8px');
    expect(axisTokens.spacing.contentMaxWidth).toBe(1440);
  });

  it('reduces component padding without changing the layout grid', () => {
    expect(axisTokens.spacing.cardPadding.comfortable).toBe(24);
    expect(axisTokens.spacing.cardPadding.compact).toBe(16);
    expect(axisTokens.radius.large).toBe(14);
  });
});
