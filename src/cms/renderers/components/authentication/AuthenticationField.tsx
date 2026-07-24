import { Box, Stack, TextField, Typography } from '@mui/material';

interface AuthenticationFieldProps {
  readonly autoComplete: string;
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type?: 'password' | 'text';
}

export function AuthenticationField({
  autoComplete,
  id,
  label,
  name,
  placeholder,
  type = 'text',
}: AuthenticationFieldProps) {
  return (
    <Stack spacing={0.75}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
        variant="subtitle2"
      >
        {label}
        <Box component="span" sx={{ color: 'error.main' }}>
          *
        </Box>
      </Typography>
      <TextField
        autoComplete={autoComplete}
        fullWidth
        id={id}
        name={name}
        placeholder={placeholder}
        required
        slotProps={{
          htmlInput: {
            'aria-label': label,
          },
        }}
        type={type}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: 48,
          },
          '& .MuiInputBase-input': {
            py: 1.375,
          },
        }}
      />
    </Stack>
  );
}
