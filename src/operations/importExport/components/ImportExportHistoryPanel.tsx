import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { ShellIcon } from '../../../app/shell/ShellIcon';
import type { ImportRunSummary } from '../api/dataReleaseContracts';
import {
  formatRunType,
  formatStatus,
  summarizeModules,
  type HistoryFilter,
} from '../importExportPresentation';

interface ImportExportHistoryPanelProps {
  readonly filter: HistoryFilter;
  readonly filteredRuns: readonly ImportRunSummary[];
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly onFilterChange: (value: HistoryFilter) => void;
  readonly onSearchChange: (value: string) => void;
  readonly runs: readonly ImportRunSummary[];
  readonly search: string;
  readonly errorMessage: string | undefined;
}

export function ImportExportHistoryPanel(props: ImportExportHistoryPanelProps) {
  return (
    <Stack spacing={1.25}>
      <Alert severity="info">
        This is the secured Nodics run projection. Axis does not retain a browser-side
        audit log.
      </Alert>
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          border: 1,
          borderColor: 'divider',
          p: { xs: 1.25, md: 1.5 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { md: 'center' }, gap: 1.25 }}
        >
          <ToggleButtonGroup
            aria-label="History type"
            exclusive
            onChange={(_, value: HistoryFilter | null) => {
              if (value) props.onFilterChange(value);
            }}
            size="small"
            value={props.filter}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="imports">Imports</ToggleButton>
            <ToggleButton value="exports">Exports</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            aria-label="Search import and export history"
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Search by run, module, status, user, or date"
            size="small"
            sx={{ flex: 1 }}
            value={props.search}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <ShellIcon color="action" fontSize="small" name="search" />
                  </InputAdornment>
                ),
                endAdornment: props.search ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear history search"
                      edge="end"
                      onClick={() => props.onSearchChange('')}
                      size="small"
                    >
                      <Box component="span" sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
                        ×
                      </Box>
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        </Stack>
      </Paper>
      {props.isLoading ? (
        <CircularProgress aria-label="Loading import history" />
      ) : null}
      {props.isError ? <Alert severity="error">{props.errorMessage}</Alert> : null}
      {props.filter === 'exports' ? (
        <Alert severity="info">
          Export history will appear here after governed export execution is enabled.
        </Alert>
      ) : null}
      {props.isSuccess && props.filter !== 'exports' && props.runs.length === 0 ? (
        <Alert severity="info">No import runs are available for this tenant.</Alert>
      ) : null}
      {props.isSuccess &&
      props.filter !== 'exports' &&
      props.runs.length > 0 &&
      props.filteredRuns.length === 0 ? (
        <Alert severity="info">No import history matches the current search.</Alert>
      ) : null}
      {props.filteredRuns.length > 0 ? (
        <Paper
          variant="outlined"
          sx={{ bgcolor: 'background.paper', overflow: 'hidden' }}
        >
          {props.filteredRuns.map((run, index) => (
            <Box key={run.runId}>
              {index > 0 ? <Divider /> : null}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{
                  alignItems: { md: 'center' },
                  gap: { xs: 1, md: 2 },
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 1.35, md: 1.5 },
                }}
              >
                <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.45}>
                  <Stack
                    direction="row"
                    sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
                  >
                    <Typography component="h3" variant="h6">
                      {formatRunType(run.dataType)}
                    </Typography>
                    <Chip label={formatStatus(run.status)} size="small" />
                    {run.createdAt ? (
                      <Typography color="text.secondary" variant="caption">
                        {run.createdAt}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Typography color="text.secondary" variant="body2">
                    {summarizeModules(run.modules)}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
                    variant="caption"
                  >
                    Run {run.runId}
                  </Typography>
                </Stack>
                <Chip
                  label={run.dataType ? run.dataType.toUpperCase() : 'IMPORT'}
                  size="small"
                  sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                />
              </Stack>
            </Box>
          ))}
        </Paper>
      ) : null}
    </Stack>
  );
}
