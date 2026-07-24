import { Button, Stack, Typography } from '@mui/material';
import type { FormEvent } from 'react';

import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';
import { AuthenticationField } from './AuthenticationField';

export function EmployeeRecoveryFormRenderer({
  component,
  actions,
}: CmsComponentRendererProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const identifier = values.get('identifier');
    actions?.onEmployeeRecovery?.(typeof identifier === 'string' ? identifier : '');
  };
  return (
    <Stack component="form" onSubmit={submit} spacing={2}>
      <Typography component="h2" sx={{ fontWeight: 700 }} variant="h6">
        {stringProperty(component, 'title')}
      </Typography>
      <AuthenticationField
        autoComplete="username"
        id="axis-employee-recovery-identifier"
        label={stringProperty(component, 'identifierLabel')}
        name="identifier"
        placeholder={stringProperty(component, 'identifierPlaceholder')}
      />
      <Button
        disabled={!actions?.onEmployeeRecovery}
        size="large"
        type="submit"
        variant="contained"
      >
        {stringProperty(component, 'submitLabel')}
      </Button>
    </Stack>
  );
}
