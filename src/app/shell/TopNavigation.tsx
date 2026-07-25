import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import type { AxisNavigationItem } from '../../bootstrap/publicBootstrap';
import { AxisMark } from './AxisMark';
import { ShellIcon } from './ShellIcon';

interface TopNavigationProps {
  readonly assistant?: AxisNavigationItem | undefined;
  readonly employeeId?: string | undefined;
  readonly navigationToggleLabel: string;
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly onNavigate: (route: string) => void;
  readonly onToggleNavigation: () => void;
  readonly onLock?: (() => void) | undefined;
  readonly onLogout?: (() => void) | undefined;
  readonly onNotify: (message: string) => void;
}

export function TopNavigation({
  assistant,
  employeeId,
  navigationToggleLabel,
  onLock,
  onLogout,
  onNotify,
  onNavigate,
  onToggleNavigation,
  onQueryChange,
  query,
}: TopNavigationProps) {
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const initials = employeeId?.slice(0, 2).toLocaleUpperCase() ?? 'AX';

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', minWidth: 0, width: '100%' }}
    >
      <Tooltip title={navigationToggleLabel}>
        <IconButton
          aria-label={navigationToggleLabel}
          edge="start"
          onClick={onToggleNavigation}
        >
          <ShellIcon name="menu" />
        </IconButton>
      </Tooltip>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <AxisMark compact />
      </Box>
      <TextField
        aria-label="Search navigation"
        placeholder="Search navigation"
        size="small"
        value={query}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          maxWidth: 360,
          minWidth: 220,
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <ShellIcon color="action" fontSize="small" name="search" />
              </InputAdornment>
            ),
          },
        }}
        onChange={(event) => {
          onQueryChange(event.target.value);
        }}
      />
      <Stack direction="row" spacing={0.5} sx={{ ml: 'auto !important' }}>
        {assistant ? (
          <Tooltip title={assistant.label}>
            <span>
              <IconButton
                aria-label={assistant.label}
                disabled={!['UP', 'DEGRADED'].includes(assistant.availability)}
                onClick={() => {
                  onNavigate(assistant.route);
                }}
              >
                <ShellIcon name={assistant.icon} />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}
        <Tooltip title="Quick create">
          <Button
            color="primary"
            startIcon={<ShellIcon name="add" />}
            sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
            variant="contained"
            onClick={() => {
              onNotify(
                'Quick create will show operations advertised by authorized modules.',
              );
            }}
          >
            Create
          </Button>
        </Tooltip>
        <Tooltip title="My Work">
          <IconButton
            aria-label="My Work"
            onClick={() => {
              onNotify('My Work will connect to the Workflow task contract.');
            }}
          >
            <Badge color="primary" badgeContent={0} showZero>
              <ShellIcon name="tasks" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            onClick={() => {
              onNotify('There are no new notifications.');
            }}
          >
            <Badge color="error" variant="dot" invisible>
              <ShellIcon name="bell" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Button
          aria-label="Open employee menu"
          color="inherit"
          sx={{ gap: 1, minWidth: 0, px: 1 }}
          onClick={(event: MouseEvent<HTMLElement>) => {
            setProfileAnchor(event.currentTarget);
          }}
        >
          <Avatar sx={{ height: 34, width: 34 }}>{initials}</Avatar>
          <Typography
            noWrap
            sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 140 }}
            variant="body2"
          >
            {employeeId ?? 'Axis recovery'}
          </Typography>
        </Button>
      </Stack>
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => {
          setProfileAnchor(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            onNotify('Employee profile workspace is not implemented yet.');
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            onNotify('Appearance preferences remain available in the shell.');
          }}
        >
          Preferences
        </MenuItem>
        {onLock ? (
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              onLock();
            }}
          >
            Lock screen
          </MenuItem>
        ) : null}
        {onLogout ? (
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              onLogout();
            }}
          >
            Sign out
          </MenuItem>
        ) : null}
      </Menu>
    </Stack>
  );
}
