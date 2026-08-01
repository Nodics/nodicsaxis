import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
  type TypographyProps,
} from '@mui/material';
import type { ReactNode } from 'react';

import { ShellIcon } from '../shell/ShellIcon';

export interface AxisHelpMetadata {
  readonly summary?: string | undefined;
  readonly documentationRoute?: string | undefined;
  readonly documentationFragment?: string | undefined;
}

export function documentationHref(help: AxisHelpMetadata | undefined): string | undefined {
  if (!help?.documentationRoute) return undefined;
  return help.documentationFragment
    ? `${help.documentationRoute}#${help.documentationFragment}`
    : help.documentationRoute;
}

export interface WorkspaceHelpActionsProps {
  readonly label: string;
  readonly help?: AxisHelpMetadata | undefined;
  readonly documentationIcon?: string | undefined;
}

export function WorkspaceHelpActions({
  label,
  help,
  documentationIcon = 'content',
}: WorkspaceHelpActionsProps) {
  const href = documentationHref(help);
  if (!help?.summary && !href) return null;
  return (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
      {help?.summary ? (
        <Tooltip arrow enterTouchDelay={0} title={help.summary}>
          <IconButton
            aria-label={`${label} help`}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ShellIcon fontSize="small" name="info" />
          </IconButton>
        </Tooltip>
      ) : null}
      {href ? (
        <Tooltip arrow title={`Open ${label} documentation`}>
          <IconButton
            aria-label={`Open ${label} documentation`}
            component="a"
            href={href}
            rel="noreferrer"
            size="small"
            sx={{ color: 'primary.main' }}
            target="_blank"
          >
            <ShellIcon fontSize="small" name={documentationIcon} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

export interface WorkspaceHeadingProps {
  readonly title: string;
  readonly description?: ReactNode | undefined;
  readonly eyebrow?: ReactNode | undefined;
  readonly help?: AxisHelpMetadata | undefined;
  readonly id?: string | undefined;
  readonly headingComponent?: TypographyProps['component'];
  readonly headingVariant?: TypographyProps['variant'];
  readonly actions?: ReactNode | undefined;
}

export function WorkspaceHeading({
  title,
  description,
  eyebrow,
  help,
  id,
  headingComponent = 'h1',
  headingVariant = 'h2',
  actions,
}: WorkspaceHeadingProps) {
  return (
    <Stack spacing={0.75}>
      {eyebrow ? (
        <Typography
          color="text.secondary"
          sx={{ fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase' }}
          variant="overline"
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Typography
            component={headingComponent}
            id={id}
            sx={{ minWidth: 0 }}
            variant={headingVariant}
          >
            {title}
          </Typography>
          <WorkspaceHelpActions help={help} label={title} />
        </Stack>
        {actions}
      </Stack>
      {description ? (
        <Typography color="text.secondary" sx={{ maxWidth: 980 }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
}
