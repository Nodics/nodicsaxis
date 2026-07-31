import { MediaManagementRoutePage } from '../../../../operations/mediaManagement/MediaManagementRoutePage';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function MediaManagementWorkspaceRenderer({
  actions,
}: CmsComponentRendererProps) {
  const controller = actions?.mediaManagement;
  if (!controller) {
    throw new Error(
      'Media Management renderer requires its presentation controller',
    );
  }
  return (
    <MediaManagementRoutePage
      accessToken={controller.accessToken}
      bootstrap={controller.bootstrap}
      runtime={controller.runtime}
    />
  );
}
