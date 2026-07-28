import { AppBar, Box, Drawer, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import type { AxisNavigationItem } from '../../bootstrap/publicBootstrap';
import { useAxisAppearance } from '../AxisAppearanceContext';
import { axisTokens } from '../axisTheme';
import { contextDisplayName } from './contextDisplayName';
import { NavigationRail } from './NavigationRail';
import {
  loadNavigationPreferences,
  navigationItemKey,
  recordRecentNavigation,
  saveNavigationPreferences,
  toggleNavigationFavourite,
} from './navigationPreferences';
import { NotificationRegion } from './ShellPrimitives';
import {
  composeShellNavigation,
  type ShellNavigationGroup,
  type ShellNavigationItem,
} from './shellNavigation';
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
  const { mode, toggleMode } = useAxisAppearance();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [navigationCompact, setNavigationCompact] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [navigationPreferences, setNavigationPreferences] = useState(() =>
    loadNavigationPreferences(),
  );
  const baseGroups = useMemo(() => composeShellNavigation(navigation), [navigation]);
  const navigationByKey = useMemo(
    () =>
      new Map(
        baseGroups
          .flatMap((group) => group.items)
          .filter((item) => !item.local)
          .map((item) => [navigationItemKey(item.moduleName, item.id), item]),
      ),
    [baseGroups],
  );
  const groups = useMemo(() => {
    const quickGroup = (
      id: string,
      label: string,
      order: number,
      keys: readonly string[],
    ): ShellNavigationGroup | undefined => {
      const items = keys
        .map((key) => navigationByKey.get(key))
        .filter((item): item is ShellNavigationItem => item !== undefined)
        .map((item) => ({ ...item, depth: 0, hasChildren: false }));
      return items.length === 0
        ? undefined
        : Object.freeze({ id, label, order, items: Object.freeze(items) });
    };
    const favourites = quickGroup(
      'favourites',
      'Favourites',
      50,
      navigationPreferences.favourites,
    );
    const favouriteKeys = new Set(navigationPreferences.favourites);
    const recents = quickGroup(
      'recents',
      'Recent Items',
      75,
      navigationPreferences.recents.filter((key) => !favouriteKeys.has(key)),
    );
    const workspaceItems = [
      ...(baseGroups.find((group) => group.id === 'workspace')?.items ?? []),
      ...(favourites?.items.map((item) => ({
        ...item,
        id: `favourite-${item.id}`,
        label: `Favourite: ${item.label}`,
        local: true,
      })) ?? []),
      ...(recents?.items.map((item) => ({
        ...item,
        id: `recent-${item.id}`,
        label: `Recent: ${item.label}`,
        local: true,
      })) ?? []),
    ];
    const mergedGroups = baseGroups.map((group) =>
      group.id === 'workspace'
        ? { ...group, items: Object.freeze(workspaceItems) }
        : group,
    );
    return Object.freeze(mergedGroups);
  }, [baseGroups, navigationByKey, navigationPreferences]);
  const assistant = useMemo(
    () =>
      navigation.find(
        (item) => item.id === 'assistant' && item.moduleName === 'aiAssistant',
      ),
    [navigation],
  );
  const contextItems = useMemo(() => {
    const environmentLabel =
      environments.length === 0
        ? 'Environment unavailable'
        : environments.length === 1
          ? `Environment: ${contextDisplayName(environments[0] ?? '')}`
          : `Environments: ${String(environments.length)}`;
    return [
      environmentLabel,
      `Tenant: ${contextDisplayName(tenantCode)}`,
      `Enterprise: ${contextDisplayName(enterpriseCode)}`,
      ...(site ? [`Site: ${contextDisplayName(site)}`] : []),
      ...(catalog ? [`Catalog: ${contextDisplayName(catalog)}`] : []),
    ];
  }, [catalog, enterpriseCode, environments, site, tenantCode]);
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

  useEffect(() => {
    saveNavigationPreferences(navigationPreferences);
  }, [navigationPreferences]);

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ behavior: 'auto', left: 0, top: 0 });
  }, [location.hash, location.pathname]);

  const navigateTo = (route: string) => {
    const item = navigation.find((candidate) => candidate.route === route);
    if (item) {
      setNavigationPreferences((current) =>
        recordRecentNavigation(current, navigationItemKey(item.moduleName, item.id)),
      );
    }
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
            contextItems={contextItems}
            employeeId={employeeId}
            navigationToggleLabel={
              desktop
                ? navigationCompact
                  ? 'Expand navigation'
                  : 'Collapse navigation'
                : 'Open navigation'
            }
            colorMode={mode}
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
            onToggleColorMode={toggleMode}
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
          favourites={new Set(navigationPreferences.favourites)}
          groups={groups}
          query={query}
          onNavigate={navigateTo}
          onQueryChange={setQuery}
          onToggleFavourite={(key) => {
            setNavigationPreferences((current) =>
              toggleNavigationFavourite(current, key),
            );
          }}
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
