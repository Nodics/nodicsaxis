import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('allows employee password fields to be revealed and hidden without changing the field contract', async () => {
    const user = userEvent.setup();
    render(
      <AuthenticationField
        autoComplete="current-password"
        id="employee-password"
        label="Password"
        name="password"
        placeholder="Enter your password"
        type="password"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
