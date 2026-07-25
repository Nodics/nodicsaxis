import type { ComponentType } from 'react';

import type { WorkbenchFieldProps } from './WorkbenchFieldProps';
import { ArrayFieldRenderer } from './fields/ArrayFieldRenderer';
import { BooleanFieldRenderer } from './fields/BooleanFieldRenderer';
import { DateFieldRenderer } from './fields/DateFieldRenderer';
import { EnumFieldRenderer } from './fields/EnumFieldRenderer';
import { NumberFieldRenderer } from './fields/NumberFieldRenderer';
import { ReadOnlyFieldRenderer } from './fields/ReadOnlyFieldRenderer';
import { StringFieldRenderer } from './fields/StringFieldRenderer';

const FIELD_RENDERERS: Readonly<Record<string, ComponentType<WorkbenchFieldProps>>> =
  Object.freeze({
    array: ArrayFieldRenderer,
    bool: BooleanFieldRenderer,
    boolean: BooleanFieldRenderer,
    date: DateFieldRenderer,
    float: NumberFieldRenderer,
    int: NumberFieldRenderer,
    number: NumberFieldRenderer,
    string: StringFieldRenderer,
  });

export function WorkbenchFieldRenderer(props: WorkbenchFieldProps) {
  if (props.field.readOnly) return <ReadOnlyFieldRenderer {...props} />;
  const Renderer = props.field.enum
    ? EnumFieldRenderer
    : (FIELD_RENDERERS[props.field.type] ?? StringFieldRenderer);
  return <Renderer {...props} />;
}
