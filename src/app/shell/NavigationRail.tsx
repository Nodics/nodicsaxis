import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { axisTokens } from '../axisTheme';
import { AxisMark } from './AxisMark';
import { ShellIcon } from './ShellIcon';
import { availabilityLabel, type ShellNavigationGroup } from './shellNavigation';

interface NavigationRailProps {
  readonly activePath: string;
  readonly groups: readonly ShellNavigationGroup[];
  readonly query: string;
  readonly onNavigate: (route: string) => void;
}

export function NavigationRail({
  activePath,
  groups,
  onNavigate,
  query,
}: NavigationRailProps) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        normalizedQuery === ''
          ? true
          : `${item.label} ${item.moduleName}`
              .toLocaleLowerCase()
              .includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Stack
      sx={{
        bgcolor: axisTokens.color.charcoal[950],
        color: 'common.white',
        height: '100%',
      }}
    >
      <Box sx={{ alignItems: 'center', display: 'flex', minHeight: 72, px: 2.5 }}>
        <AxisMark reverse />
      </Box>
      <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />
      <Box
        component="nav"
        aria-label="Primary navigation"
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 1.5,
          scrollbarColor: `${alpha('#ffffff', 0.2)} transparent`,
        }}
      >
        {visibleGroups.map((group) => (
          <Box key={group.id} sx={{ mb: 1.5 }}>
            <Typography
              sx={{
                color: alpha('#ffffff', 0.48),
                px: 2.5,
                pb: 0.75,
                pt: 1.25,
              }}
              variant="overline"
            >
              {group.label}
            </Typography>
            <List disablePadding sx={{ px: 1 }}>
              {group.items.map((item) => {
                const unavailable = item.availability === 'UNAVAILABLE';
                return (
                  <ListItemButton
                    key={`${item.moduleName}:${item.id}`}
                    aria-label={item.label}
                    disabled={unavailable}
                    selected={activePath === item.route}
                    sx={{
                      borderRadius: `${String(axisTokens.radius.small)}px`,
                      color: alpha('#ffffff', 0.74),
                      mb: 0.5,
                      minHeight: 42,
                      px: 1.5,
                      position: 'relative',
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.07),
                        color: 'common.white',
                      },
                      '&.Mui-selected': {
                        bgcolor: alpha(axisTokens.color.signatureGold, 0.14),
                        color: 'common.white',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: alpha(axisTokens.color.signatureGold, 0.2),
                      },
                      '&.Mui-selected::before': {
                        bgcolor: 'primary.main',
                        borderRadius: '0 2px 2px 0',
                        bottom: 8,
                        content: '""',
                        left: -8,
                        position: 'absolute',
                        top: 8,
                        width: 3,
                      },
                    }}
                    onClick={() => {
                      onNavigate(item.route);
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color:
                          activePath === item.route
                            ? 'primary.main'
                            : alpha('#ffffff', 0.5),
                        minWidth: 36,
                      }}
                    >
                      <ShellIcon fontSize="small" name={item.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={
                        item.availability === 'UP'
                          ? undefined
                          : availabilityLabel(item.availability)
                      }
                      slotProps={{
                        primary: { noWrap: true },
                        secondary: { noWrap: true },
                      }}
                    />
                    {!item.local && item.availability !== 'UP' ? (
                      <Tooltip title={availabilityLabel(item.availability)}>
                        <Box
                          aria-label={availabilityLabel(item.availability)}
                          component="span"
                          sx={{
                            bgcolor:
                              item.availability === 'DEGRADED'
                                ? 'warning.main'
                                : 'error.main',
                            borderRadius: '50%',
                            height: 7,
                            mr: 0.5,
                            width: 7,
                          }}
                        />
                      </Tooltip>
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
        {visibleGroups.length === 0 ? (
          <Typography sx={{ color: alpha('#ffffff', 0.56), px: 2.5, py: 3 }}>
            No navigation results
          </Typography>
        ) : null}
      </Box>
      <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box
            aria-hidden="true"
            sx={{
              bgcolor: 'success.main',
              borderRadius: '50%',
              boxShadow: `0 0 0 3px ${alpha(axisTokens.color.success, 0.16)}`,
              height: 7,
              width: 7,
            }}
          />
          <Typography sx={{ color: alpha('#ffffff', 0.64) }} variant="caption">
            Registry connected
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}
