import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import type { AxisDocumentationSource } from '../bootstrap/publicBootstrap';
import { axisTokens } from '../app/axisTheme';

interface DocumentationSourceNavigationProps {
  readonly activeSourceId: string;
  readonly sources: readonly AxisDocumentationSource[];
}

export function DocumentationSourceNavigation({
  activeSourceId,
  sources,
}: DocumentationSourceNavigationProps) {
  return (
    <Paper
      component="nav"
      aria-label="Documentation products"
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 0,
        overflowX: 'auto',
        p: '3px',
      }}
    >
      <Box
        role="tablist"
        sx={{
          alignItems: 'center',
          display: 'flex',
          gap: 0.75,
          minWidth: 'max-content',
        }}
      >
        {sources.map((source) => {
          const selected = source.id === activeSourceId;
          return (
            <ButtonBase
              component={RouterLink}
              aria-selected={selected}
              key={source.id}
              role="tab"
              to={source.route}
              sx={{
                border: 1,
                borderColor: selected ? 'primary.main' : 'transparent',
                borderRadius: axisTokens.radius.pill,
                color: selected ? 'text.primary' : 'text.secondary',
                minHeight: 36,
                px: 2,
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'border-color']),
                ...(selected
                  ? { bgcolor: 'primary.main' }
                  : {
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'divider',
                      },
                    }),
              }}
            >
              <Typography component="span" variant="subtitle2">
                {source.label}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Paper>
  );
}
