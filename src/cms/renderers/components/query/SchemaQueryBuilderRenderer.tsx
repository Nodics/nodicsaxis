import { SchemaQueryBuilder } from '../../../../schema/query/SchemaQueryBuilder';
import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function SchemaQueryBuilderRenderer({
  component,
  actions,
}: CmsComponentRendererProps) {
  const controller = actions?.workbench;
  const selected = controller?.selectedSchema;
  if (!controller || !selected) return null;

  return (
    <SchemaQueryBuilder
      key={`${selected.moduleName}:${selected.schemaName}`}
      capabilities={selected.queryCapabilities}
      copy={{
        addConditionLabel: stringProperty(component, 'addConditionLabel'),
        addGroupLabel: stringProperty(component, 'addGroupLabel'),
        applyFiltersLabel: stringProperty(component, 'applyFiltersLabel'),
        ascendingLabel: stringProperty(component, 'ascendingLabel', 'Ascending'),
        clearFiltersLabel: stringProperty(component, 'clearFiltersLabel'),
        descendingLabel: stringProperty(component, 'descendingLabel', 'Descending'),
        fieldLabel: stringProperty(component, 'filterFieldLabel'),
        filterBuilderLabel: stringProperty(component, 'filterBuilderLabel'),
        matchLabel: stringProperty(component, 'filterMatchLabel'),
        noFiltersSummaryLabel: stringProperty(
          component,
          'noFiltersSummaryLabel',
          'No advanced conditions are applied. Text search and sort can still be used.',
        ),
        operatorLabel: stringProperty(component, 'filterOperatorLabel'),
        removeLabel: stringProperty(component, 'removeFilterLabel'),
        requestPreviewLabel: stringProperty(component, 'requestPreviewLabel'),
        sortBuilderLabel: stringProperty(
          component,
          'sortBuilderLabel',
          'Sort results',
        ),
        sortDirectionLabel: stringProperty(
          component,
          'sortDirectionLabel',
          'Direction',
        ),
        sortFieldLabel: stringProperty(component, 'sortFieldLabel', 'Sort field'),
        valueLabel: stringProperty(component, 'filterValueLabel'),
      }}
      sort={controller.recordSort}
      value={controller.recordFilters}
      onChange={controller.setRecordFilters}
      onSortChange={controller.setRecordSort}
    />
  );
}
