import { describe, expect, it } from 'vitest';

import { nextAxisSortOverride } from '../../../src/app/table/axisTableSorting';

describe('axisTableSorting', () => {
  it('cycles sortable table headers through ascending, descending, and normal', () => {
    const ascending = nextAxisSortOverride(undefined, 'code');
    expect(ascending).toEqual({ field: 'code', direction: 'ASC' });

    const descending = nextAxisSortOverride(ascending, 'code');
    expect(descending).toEqual({ field: 'code', direction: 'DESC' });

    expect(nextAxisSortOverride(descending, 'code')).toBeUndefined();
  });

  it('starts a new ascending sort when a different header is selected', () => {
    expect(nextAxisSortOverride({ field: 'code', direction: 'DESC' }, 'name')).toEqual({
      field: 'name',
      direction: 'ASC',
    });
  });
});
