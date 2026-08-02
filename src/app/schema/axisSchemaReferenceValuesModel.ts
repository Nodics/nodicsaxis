import type { WorkbenchRelationship } from '../../workbench/api/workbenchContracts';
import { axisSchemaRecordDisplayValue } from './axisSchemaRecordValues';

export interface AxisSchemaReferenceValue {
  readonly displayValue: string;
  readonly relationship: WorkbenchRelationship;
  readonly reference: string;
}

function referenceValue(value: unknown, referenceProperty: string): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const objectValue = value as Readonly<Record<string, unknown>>;
    return referenceValue(
      objectValue[referenceProperty] ??
        objectValue.code ??
        objectValue.id ??
        objectValue.name,
      referenceProperty,
    );
  }
  return undefined;
}

export function axisSchemaRelationshipReferences(
  value: unknown,
  relationship: WorkbenchRelationship,
): readonly AxisSchemaReferenceValue[] {
  const values = Array.isArray(value) ? value : [value];
  return Object.freeze(
    values
      .map((item) => {
        const reference = referenceValue(item, relationship.referenceProperty);
        if (!reference) return undefined;
        return Object.freeze({
          displayValue: axisSchemaRecordDisplayValue(item),
          reference,
          relationship,
        });
      })
      .filter((item) => item !== undefined),
  );
}
