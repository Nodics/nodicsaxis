import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface AssistantClarificationCardProps {
  readonly clarification: Readonly<Record<string, unknown>>;
  readonly title: string;
  readonly submitLabel: string;
  readonly onSubmit: (answer: string) => Promise<void>;
}

function clarificationPrompt(value: Readonly<Record<string, unknown>>): string {
  for (const candidate of [value.prompt, value.question, value.message]) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return '';
}

export function AssistantClarificationCard(props: AssistantClarificationCardProps) {
  const [answer, setAnswer] = useState('');
  const prompt = clarificationPrompt(props.clarification);
  if (!prompt) return null;

  return (
    <Alert severity="info" variant="outlined">
      <Stack spacing={1.5}>
        <Typography component="h3" sx={{ fontWeight: 700 }}>
          {props.title}
        </Typography>
        <Typography>{prompt}</Typography>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={answer}
          slotProps={{ htmlInput: { 'aria-label': prompt } }}
          onChange={(event) => setAnswer(event.target.value)}
        />
        <Button
          disabled={!answer.trim()}
          sx={{ alignSelf: 'flex-start' }}
          variant="contained"
          onClick={() => {
            const value = answer.trim();
            setAnswer('');
            void props.onSubmit(value);
          }}
        >
          {props.submitLabel}
        </Button>
      </Stack>
    </Alert>
  );
}
