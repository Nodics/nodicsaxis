import { Box, CircularProgress } from '@mui/material';
import { createElement, Suspense } from 'react';

import type { CmsComponentContract, CmsResolvedPageContract } from './cmsContract';
import { getPageRenderer } from './renderers/registry/pageRendererRegistry';
import { isRendererSupported } from './renderers/registry/rendererManifest';
import { CmsRenderBoundary } from './renderers/shared/CmsRenderBoundary';
import type { CmsRendererActions } from './renderers/shared/rendererTypes';

interface CmsPageRendererProps {
  readonly contract: CmsResolvedPageContract;
  readonly actions?: CmsRendererActions | undefined;
}

function assertComponentCompatibility(
  component: CmsComponentContract,
  channel: string,
): void {
  if (!component.rendererChannels.includes(channel)) {
    throw new Error(
      `CMS component renderer ${component.renderer} does not support channel ${channel}`,
    );
  }
  if (
    !isRendererSupported(
      component.renderer,
      'component',
      component.rendererContractVersion,
    )
  ) {
    throw new Error(
      `Unsupported CMS component renderer contract: ${component.renderer}@${String(component.rendererContractVersion)}`,
    );
  }
  component.components.forEach((child) => assertComponentCompatibility(child, channel));
}

function CompatiblePage({ contract, actions }: CmsPageRendererProps) {
  const { page } = contract;
  if (!page.rendererChannels.includes(contract.channel)) {
    throw new Error(
      `CMS page renderer ${page.renderer} does not support channel ${contract.channel}`,
    );
  }
  if (!isRendererSupported(page.renderer, 'page', page.rendererContractVersion)) {
    throw new Error(
      `Unsupported CMS page renderer contract: ${page.renderer}@${String(page.rendererContractVersion)}`,
    );
  }
  if (
    !isRendererSupported(
      page.templateContract.renderer,
      'template',
      page.templateContract.contractVersion,
    )
  ) {
    throw new Error(
      `Unsupported CMS template renderer contract: ${page.templateContract.renderer}@${String(page.templateContract.contractVersion)}`,
    );
  }
  page.components.forEach((component) =>
    assertComponentCompatibility(component, contract.channel),
  );

  const PageRenderer = getPageRenderer(page.renderer);
  if (!PageRenderer) {
    throw new Error(`Unsupported CMS page renderer: ${page.renderer}`);
  }
  return createElement(PageRenderer, { actions, page });
}

export function CmsPageRenderer(props: CmsPageRendererProps) {
  return (
    <CmsRenderBoundary>
      <Suspense
        fallback={
          <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}>
            <CircularProgress aria-label="Loading page presentation" />
          </Box>
        }
      >
        <CompatiblePage {...props} />
      </Suspense>
    </CmsRenderBoundary>
  );
}
