import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthenticationField } from '../../../../../src/cms/renderers/components/authentication/AuthenticationField';

describe('AuthenticationField', () => {
  it('uses a separate accessible label instead of a floating outline label', () => {
    render(
      <AuthenticationField
        autoComplete="username"
        id="employee-id"
        label="Employee username"
        name="loginId"
        placeholder="Enter your username"
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Employee username' });
    expect(input).toHaveAttribute('id', 'employee-id');
    expect(input).toHaveAttribute('required');
    expect(
      input.closest('.MuiFormControl-root')?.querySelector('.MuiInputLabel-root'),
    ).toBeNull();
  });
});
