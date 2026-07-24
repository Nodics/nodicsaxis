import { AuthenticationTemplateRenderer } from '../templates/AuthenticationTemplateRenderer';
import type { CmsPagePresentationProps } from '../shared/rendererTypes';
import { renderComponentCollection } from './renderComponentCollection';

export function AuthenticationPageRenderer({
  page,
  actions,
}: CmsPagePresentationProps) {
  if (page.templateContract.renderer !== 'axis.template.authentication') {
    throw new Error(
      `Authentication page requires axis.template.authentication, received ${page.templateContract.renderer}`,
    );
  }
  const ordered = [...page.components].sort((left, right) => left.index - right.index);
  const slot = (name: string) =>
    renderComponentCollection(
      ordered.filter((component) => component.slot === name),
      actions,
    );
  return (
    <AuthenticationTemplateRenderer
      slots={{
        showcase: slot('showcase'),
        brand: slot('brand'),
        introduction: slot('introduction'),
        authentication: slot('authentication'),
        assistance: slot('assistance'),
        legal: slot('legal'),
      }}
    />
  );
}
