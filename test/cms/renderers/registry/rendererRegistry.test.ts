import { describe, expect, it } from 'vitest';

import { COMPONENT_RENDERER_REGISTRY } from '../../../../src/cms/renderers/registry/componentRendererRegistry';
import { PAGE_RENDERER_REGISTRY } from '../../../../src/cms/renderers/registry/pageRendererRegistry';
import { CMS_RENDERER_MANIFEST } from '../../../../src/cms/renderers/registry/rendererManifest';
import { isRendererSupported } from '../../../../src/cms/renderers/registry/rendererManifest';

describe('CMS renderer registries', () => {
  it('maps every declared component renderer to one Axis implementation', () => {
    const declared = Object.entries(CMS_RENDERER_MANIFEST)
      .filter(([, contract]) => contract.kind === 'component')
      .map(([key]) => key)
      .sort();

    expect(Object.keys(COMPONENT_RENDERER_REGISTRY).sort()).toEqual(declared);
  });

  it('maps every declared page renderer to one Axis implementation', () => {
    const declared = Object.entries(CMS_RENDERER_MANIFEST)
      .filter(([, contract]) => contract.kind === 'page')
      .map(([key]) => key)
      .sort();

    expect(Object.keys(PAGE_RENDERER_REGISTRY).sort()).toEqual(declared);
  });

  it('resolves required renderer keys through typed lazy registry entries', () => {
    expect(
      COMPONENT_RENDERER_REGISTRY['axis.component.employee-login-form'],
    ).toBeDefined();
    expect(
      COMPONENT_RENDERER_REGISTRY['documentation.component.article'],
    ).toBeDefined();
    expect(PAGE_RENDERER_REGISTRY['axis.page.authentication']).toBeDefined();
    expect(PAGE_RENDERER_REGISTRY['axis.page.media-management']).toBeDefined();
    expect(
      COMPONENT_RENDERER_REGISTRY['axis.component.media-management-workspace'],
    ).toBeDefined();
    expect(PAGE_RENDERER_REGISTRY['documentation.page.article']).toBeDefined();
  });

  it('accepts both supported documentation contracts and rejects unknown versions', () => {
    expect(isRendererSupported('documentation.page.article', 'page', 1)).toBe(true);
    expect(isRendererSupported('documentation.page.article', 'page', 2)).toBe(true);
    expect(isRendererSupported('documentation.template.article', 'template', 2)).toBe(
      true,
    );
    expect(
      isRendererSupported('documentation.component.navigation', 'component', 2),
    ).toBe(true);
    expect(isRendererSupported('documentation.page.article', 'page', 3)).toBe(false);
  });
});
