import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import type { WorkbenchRelationship } from '../../workbench/api/workbenchContracts';
import { axisSchemaRecordDisplayValue } from './axisSchemaRecordValues';

export interface AxisSchemaReferenceValue {
  readonly displayValue: string;
  readonly relationship: WorkbenchRelationship;
  readonly reference: string;
}

export interface AxisSchemaReferenceValuesProps {
  readonly maxVisible?: number | undefined;
  readonly references: readonly AxisSchemaReferenceValue[];
  readonly size?: 'small' | 'medium' | undefined;
  readonly variant?: 'text' | 'outlined' | undefined;
  readonly onReferenceClick: (reference: AxisSchemaReferenceValue) => void;
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

export function AxisSchemaReferenceValues({
  maxVisible = 3,
  references,
  size = 'small',
  variant = 'text',
  onReferenceClick,
}: AxisSchemaReferenceValuesProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleReferences = expanded ? references : references.slice(0, maxVisible);
  const hiddenCount = Math.max(0, references.length - visibleReferences.length);
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {visibleReferences.map((reference) => (
        <Button
          key={`${reference.relationship.field}:${reference.reference}`}
          size={size}
          variant={variant}
          onClick={(event) => {
            event.stopPropagation();
            onReferenceClick(reference);
          }}
        >
          {reference.displayValue}
        </Button>
      ))}
      {hiddenCount > 0 ? (
        <Button
          size={size}
          variant="text"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded(true);
          }}
        >
          +{String(hiddenCount)} more
        </Button>
      ) : null}
      {expanded && references.length > maxVisible ? (
        <Button
          size={size}
          variant="text"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded(false);
          }}
        >
          Show fewer
        </Button>
      ) : null}
      {references.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          —
        </Typography>
      ) : null}
    </Stack>
  );
}
