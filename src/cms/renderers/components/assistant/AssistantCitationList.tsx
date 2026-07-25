import { List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';

import type { AssistantCitation } from '../../../../assistant/api/assistantContracts';

interface AssistantCitationListProps {
  readonly citations: readonly AssistantCitation[];
  readonly title: string;
  readonly emptyLabel: string;
}

export function AssistantCitationList(props: AssistantCitationListProps) {
  return (
    <Paper component="section" variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography component="h3" sx={{ fontWeight: 700 }}>
          {props.title}
        </Typography>
        {props.citations.length ? (
          <List dense disablePadding>
            {props.citations.map((citation) => {
              const details = [citation.section, citation.locator, citation.version]
                .filter(Boolean)
                .join(' · ');
              return (
                <ListItem key={citation.citationId} disableGutters>
                  <ListItemText
                    primary={citation.title}
                    secondary={details || citation.citationId}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2">
            {props.emptyLabel}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
