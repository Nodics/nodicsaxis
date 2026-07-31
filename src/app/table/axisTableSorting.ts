export type AxisSortDirection = 'ASC' | 'DESC';

export interface AxisSort {
  readonly field: string;
  readonly direction: AxisSortDirection;
}

export function sameAxisSort(
  left: AxisSort | undefined,
  right: AxisSort | undefined,
): boolean {
  return Boolean(
    left && right && left.field === right.field && left.direction === right.direction,
  );
}

export function nextAxisSortOverride(
  currentOverride: AxisSort | undefined,
  field: string,
): AxisSort | undefined {
  if (!currentOverride || currentOverride.field !== field) {
    return Object.freeze({ field, direction: 'ASC' });
  }
  if (currentOverride.direction === 'ASC') {
    return Object.freeze({ field, direction: 'DESC' });
  }
  return undefined;
}
