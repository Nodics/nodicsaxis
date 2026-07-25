import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  Stack,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import type { AxisNavigationItem } from '../../bootstrap/publicBootstrap';
import { useAxisAppearance } from '../AxisAppearanceContext';
import { axisTokens } from '../axisTheme';
import { contextDisplayName } from './contextDisplayName';
import { NavigationRail } from './NavigationRail';
import { NotificationRegion } from './ShellPrimitives';
import { composeShellNavigation } from './shellNavigation';
import { TopNavigation } from './TopNavigation';

interface AppShellProps extends PropsWithChildren {
  readonly employeeId?: string | undefined;
  readonly enterpriseCode?: string | undefined;
  readonly tenantCode?: string | undefined;
  readonly environments?: readonly string[] | undefined;
  readonly site?: string | undefined;
  readonly catalog?: string | undefined;
  readonly navigation?: readonly AxisNavigationItem[] | undefined;
  readonly onLock?: (() => void) | undefined;
  readonly onLogout?: (() => void) | undefined;
}

export function AppShell({
  catalog,
  children,
  employeeId,
  enterpriseCode = 'default',
  tenantCode = 'default',
  environments = [],
  navigation = [],
  onLock,
  onLogout,
  site,
}: AppShellProps) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { density, mode, toggleDensity, toggleMode } = useAxisAppearance();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [navigationCompact, setNavigationCompact] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const groups = useMemo(() => composeShellNavigation(navigation), [navigation]);
  const assistant = useMemo(
    () =>
      navigation.find(
        (item) => item.id === 'assistant' && item.moduleName === 'aiAssistant',
      ),
    [navigation],
  );
  const environmentLabel =
    environments.length === 0
      ? 'Environment unavailable'
      : environments.length === 1
        ? `Environment: ${contextDisplayName(environments[0] ?? '')}`
        : `${String(environments.length)} environments`;
  const desktopRailWidth = navigationCompact
    ? axisTokens.spacing.shellRailCompact
    : axisTokens.spacing.shellRail;

  useEffect(() => {
    const offline = () => {
      setNotification('Axis is offline. Administrative operations are paused.');
    };
    const online = () => {
      setNotification('Connection restored.');
    };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => {
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    };
  }, []);

  const navigateTo = (route: string) => {
    setNavigationOpen(false);
    setQuery('');
    void navigate(route);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { md: `${String(desktopRailWidth)}px` },
          transition: (currentTheme) =>
            currentTheme.transitions.create(['margin-left', 'width'], {
              duration: axisTokens.motion.standard,
            }),
          width: { md: `calc(100% - ${String(desktopRailWidth)}px)` },
          zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Toolbar
          sx={{
            gap: 1,
            minHeight: `${String(axisTokens.spacing.header)}px !important`,
          }}
        >
          <TopNavigation
            assistant={assistant}
            employeeId={employeeId}
            navigationToggleLabel={
              desktop
                ? navigationCompact
                  ? 'Expand navigation'
                  : 'Collapse navigation'
                : 'Open navigation'
            }
            query={query}
            onLock={onLock}
            onLogout={onLogout}
            onNavigate={navigateTo}
            onNotify={setNotification}
            onToggleNavigation={() => {
              if (desktop) {
                setNavigationCompact((current) => !current);
              } else {
                setNavigationOpen(true);
              }
            }}
            onQueryChange={setQuery}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        ModalProps={{ keepMounted: true }}
        open={desktop || navigationOpen}
        variant={desktop ? 'permanent' : 'temporary'}
        slotProps={{
          paper: {
            sx: {
              borderRight: '1px solid',
              borderColor: 'divider',
              overflowX: 'hidden',
              transition: (currentTheme) =>
                currentTheme.transitions.create('width', {
                  duration: axisTokens.motion.standard,
                }),
              width: desktop ? desktopRailWidth : axisTokens.spacing.shellRail,
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            },
          },
        }}
        onClose={() => {
          setNavigationOpen(false);
        }}
      >
        <NavigationRail
          activePath={location.pathname}
          compact={desktop && navigationCompact}
          groups={groups}
          query={query}
          onNavigate={navigateTo}
        />
      </Drawer>
      <Box
        sx={{
          flexGrow: 1,
          ml: { md: `${String(desktopRailWidth)}px` },
          minWidth: 0,
          pt: `${String(axisTokens.spacing.header)}px`,
          transition: (currentTheme) =>
            currentTheme.transitions.create(['margin-left', 'width'], {
              duration: axisTokens.motion.standard,
            }),
          width: { md: `calc(100% - ${String(desktopRailWidth)}px)` },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Stack
          component="section"
          aria-label="Active context"
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: axisTokens.spacing.context,
            overflowX: 'auto',
            px: { xs: 2, md: 3 },
          }}
        >
          <Chip label={environmentLabel} size="small" variant="outlined" />
          <Chip
            label={`Tenant: ${contextDisplayName(tenantCode)}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Enterprise: ${contextDisplayName(enterpriseCode)}`}
            size="small"
            variant="outlined"
          />
          {site ? (
            <Chip
              label={`Site: ${contextDisplayName(site)}`}
              size="small"
              variant="outlined"
            />
          ) : null}
          {catalog ? (
            <Chip
              label={`Catalog: ${contextDisplayName(catalog)}`}
              size="small"
              variant="outlined"
            />
          ) : null}
          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto !important' }}>
            <Tooltip title="Change interface density">
              <Button
                aria-label="Change interface density"
                color="inherit"
                size="small"
                onClick={toggleDensity}
              >
                {density === 'comfortable' ? 'Comfortable' : 'Compact'}
              </Button>
            </Tooltip>
            <Tooltip title="Change color mode">
              <Button
                aria-label="Change color mode"
                color="inherit"
                size="small"
                onClick={toggleMode}
              >
                {mode === 'light' ? 'Dark' : 'Light'}
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
        <Box component="main" id="main-content">
          {children}
        </Box>
      </Box>
      <NotificationRegion
        message={notification}
        severity={notification === 'Connection restored.' ? 'success' : 'info'}
        onClose={() => {
          setNotification(null);
        }}
      />
    </Box>
  );
}
