import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import type {
  AxisDocumentationSource,
  AxisModuleConnection,
} from '../bootstrap/publicBootstrap';
import { WorkspaceContainer } from '../app/shell/ShellPrimitives';
import type { AxisRuntimeConfig } from '../runtime/runtimeConfig';
import { createOpenApiClient } from './api/openApiClient';

interface OpenApiDocumentationRendererProps {
  readonly accessToken: string;
  readonly connection: AxisModuleConnection;
  readonly enterpriseCode: string;
  readonly runtime: AxisRuntimeConfig;
  readonly source: Extract<AxisDocumentationSource, { readonly type: 'OPENAPI' }>;
}

const OPERATION_PAGE_SIZE = 100;
const methodColors: Readonly<
  Record<string, 'success' | 'info' | 'warning' | 'error' | 'secondary'>
> = {
  GET: 'success',
  POST: 'info',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'error',
};

export function OpenApiDocumentationRenderer({
  accessToken,
  connection,
  enterpriseCode,
  runtime,
  source,
}: OpenApiDocumentationRendererProps) {
  const [query, setQuery] = useState('');
  const [visibleOperationCount, setVisibleOperationCount] =
    useState(OPERATION_PAGE_SIZE);
  const client = useMemo(
    () =>
      createOpenApiClient({
        connection,
        openApiPath: source.openApiPath,
        enterpriseCode,
        accessToken,
        timeoutMs: runtime.requestTimeoutMs,
      }),
    [
      accessToken,
      connection,
      enterpriseCode,
      runtime.requestTimeoutMs,
      source.openApiPath,
    ],
  );
  const reference = useQuery({
    queryKey: ['openapi-reference', connection.endpoint, source.openApiPath],
    queryFn: client,
  });
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const operations =
    reference.data?.operations.filter((operation) =>
      [
        operation.method,
        operation.path,
        operation.summary,
        operation.description,
        ...operation.tags,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    ) ?? [];
  const visibleOperations = operations.slice(0, visibleOperationCount);
  const swaggerUrl = new URL(source.swaggerPath, connection.endpoint).toString();

  return (
    <WorkspaceContainer horizontalPadding="3px" verticalPadding="3px">
      <Stack spacing="3px">
        <Paper
          component="section"
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}
        >
          <Box sx={{ bgcolor: 'background.paper', p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack spacing={0.5}>
                <Typography color="primary.dark" variant="overline">
                  Live backend contract
                </Typography>
                <Typography component="h1" variant="h2">
                  {reference.data?.title ?? 'Nodics API reference'}
                </Typography>
                <Typography color="text.secondary">
                  Search the APIs currently exposed by this Nodics runtime.
                </Typography>
              </Stack>
              <Button
                component="a"
                href={swaggerUrl}
                rel="noopener noreferrer"
                target="_blank"
                variant="outlined"
              >
                Open interactive Swagger
              </Button>
            </Stack>
          </Box>
          <Box sx={{ bgcolor: 'action.hover', p: { xs: 2, md: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <TextField
                fullWidth
                label="Search APIs"
                placeholder="Search by operation, path, method, or module"
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">⌕</InputAdornment>,
                  },
                }}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleOperationCount(OPERATION_PAGE_SIZE);
                }}
              />
              {reference.data ? (
                <Chip
                  label={`${String(operations.length)} of ${String(reference.data.operations.length)} APIs`}
                  variant="outlined"
                />
              ) : null}
            </Stack>
          </Box>
        </Paper>

        {reference.isPending ? (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}
          >
            <CircularProgress size={28} />
            <Typography>Loading the live API contract…</Typography>
          </Stack>
        ) : null}
        {reference.error instanceof Error ? (
          <Alert
            action={
              <Button color="inherit" onClick={() => void reference.refetch()}>
                Retry
              </Button>
            }
            severity="error"
          >
            {reference.error.message}
          </Alert>
        ) : null}
        {reference.data && operations.length === 0 ? (
          <Alert severity="info">No APIs match your search.</Alert>
        ) : null}
        {visibleOperations.length > 0 ? (
          <Stack spacing={1}>
            {visibleOperations.map((operation) => (
              <Accordion
                disableGutters
                elevation={0}
                key={`${operation.method}:${operation.path}`}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<span aria-hidden="true">⌄</span>}
                  sx={{ '& .MuiAccordionSummary-content': { minWidth: 0 } }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ alignItems: { sm: 'center' }, minWidth: 0 }}
                  >
                    <Chip
                      color={methodColors[operation.method] ?? 'secondary'}
                      label={operation.method}
                      size="small"
                      sx={{ fontWeight: 700, minWidth: 68 }}
                    />
                    <Typography
                      component="code"
                      sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}
                    >
                      {operation.path}
                    </Typography>
                    <Typography color="text.secondary" noWrap>
                      {operation.summary}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1.5}>
                    <Typography>
                      {operation.description || operation.summary}
                    </Typography>
                    {operation.tags.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {operation.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : null}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
            {visibleOperations.length < operations.length ? (
              <Button
                onClick={() =>
                  setVisibleOperationCount((current) => current + OPERATION_PAGE_SIZE)
                }
                sx={{ alignSelf: 'center', mt: 1 }}
                variant="outlined"
              >
                Load more APIs
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </WorkspaceContainer>
  );
}
