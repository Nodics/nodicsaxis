import {
  Alert,
  Box,
  Chip,
  Divider,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import { arrayProperty, stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

const MAX_BLOCKS = 1000;
const MAX_LIST_ITEMS = 200;
const MAX_TABLE_ROWS = 200;
const MAX_TEXT_LENGTH = 100_000;

type DocumentationBlock = Readonly<Record<string, unknown>>;

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.slice(0, MAX_TEXT_LENGTH) : fallback;
}

function stringList(value: unknown, limit = MAX_LIST_ITEMS): readonly string[] {
  return Array.isArray(value) ? value.slice(0, limit).map((item) => text(item)) : [];
}

function safeHref(value: string): string | undefined {
  if (
    value.startsWith('/docs') ||
    value.startsWith('#') ||
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('mailto:')
  ) {
    return value;
  }
  return undefined;
}

function inlineContent(value: string): ReactNode {
  const parts: ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(value)) !== null) {
    if (match.index > cursor) parts.push(value.slice(cursor, match.index));
    const label = match[1] ?? '';
    const href = safeHref(match[2] ?? '');
    if (!href) {
      parts.push(label);
    } else if (href.startsWith('/')) {
      parts.push(
        <Link component={RouterLink} key={`${match.index}:${href}`} to={href}>
          {label}
        </Link>,
      );
    } else {
      parts.push(
        <Link
          href={href}
          key={`${match.index}:${href}`}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {label}
        </Link>,
      );
    }
    cursor = linkPattern.lastIndex;
  }
  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts.length > 0 ? parts : value;
}

function headingVariant(level: number): 'h1' | 'h2' | 'h3' | 'h4' {
  if (level <= 1) return 'h1';
  if (level === 2) return 'h2';
  if (level === 3) return 'h3';
  return 'h4';
}

function DocumentationBlockRenderer({
  block,
  index,
}: {
  readonly block: DocumentationBlock;
  readonly index: number;
}) {
  const kind = text(block.kind);
  const key = `${kind}:${String(index)}`;
  if (kind === 'heading') {
    const level =
      typeof block.level === 'number' && Number.isInteger(block.level)
        ? Math.min(4, Math.max(1, block.level))
        : 2;
    return (
      <Typography
        component={`h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4'}
        id={text(block.anchor) || undefined}
        key={key}
        sx={{ scrollMarginTop: 96 }}
        variant={headingVariant(level)}
      >
        {inlineContent(text(block.text))}
      </Typography>
    );
  }
  if (kind === 'paragraph') {
    return (
      <Typography key={key} sx={{ lineHeight: 1.8 }}>
        {inlineContent(text(block.text))}
      </Typography>
    );
  }
  if (kind === 'unordered-list' || kind === 'ordered-list') {
    const Component = kind === 'ordered-list' ? 'ol' : 'ul';
    return (
      <Box component={Component} key={key} sx={{ m: 0, pl: 3.5 }}>
        {stringList(block.items).map((item, itemIndex) => (
          <Typography
            component="li"
            key={`${key}:${String(itemIndex)}`}
            sx={{ lineHeight: 1.8, mb: 0.75 }}
          >
            {inlineContent(item)}
          </Typography>
        ))}
      </Box>
    );
  }
  if (kind === 'blockquote') {
    return (
      <Box
        component="blockquote"
        key={key}
        sx={{ borderLeft: 4, borderColor: 'primary.main', m: 0, pl: 2 }}
      >
        <Typography color="text.secondary">
          {inlineContent(text(block.text))}
        </Typography>
      </Box>
    );
  }
  if (kind === 'code') {
    return (
      <Box
        component="pre"
        key={key}
        sx={{
          bgcolor: 'grey.950',
          borderRadius: 1.5,
          color: 'common.white',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          m: 0,
          overflowX: 'auto',
          p: 2,
          whiteSpace: 'pre',
        }}
      >
        <code>{text(block.text)}</code>
      </Box>
    );
  }
  if (kind === 'table') {
    const headers = stringList(block.headers, 50);
    const rows = Array.isArray(block.rows)
      ? block.rows.slice(0, MAX_TABLE_ROWS).map((row) => stringList(row, 50))
      : [];
    return (
      <TableContainer key={key} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, cellIndex) => (
                <TableCell key={`${key}:header:${String(cellIndex)}`}>
                  {inlineContent(header)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`${key}:row:${String(rowIndex)}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`${key}:cell:${String(rowIndex)}:${String(cellIndex)}`}
                  >
                    {inlineContent(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  if (kind === 'image') {
    return (
      <Alert icon={false} key={key} severity="info">
        Documentation image: {text(block.alt, text(block.title, 'Image'))}
      </Alert>
    );
  }
  return null;
}

export function DocumentationArticleRenderer({ component }: CmsComponentRendererProps) {
  const title = stringProperty(component, 'title', 'Documentation');
  const category = stringProperty(component, 'category');
  const audience = stringList(arrayProperty(component, 'audience'), 20);
  const blocks = arrayProperty(component, 'blocks')
    .slice(0, MAX_BLOCKS)
    .filter(
      (block): block is DocumentationBlock =>
        typeof block === 'object' && block !== null && !Array.isArray(block),
    )
    .filter(
      (block, index) =>
        !(
          index === 0 &&
          block.kind === 'heading' &&
          block.level === 1 &&
          block.text === title
        ),
    );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {category ? <Chip label={category} size="small" /> : null}
          {audience.map((item) => (
            <Chip key={item} label={item} size="small" variant="outlined" />
          ))}
        </Box>
        <Typography component="p" color="text.secondary" variant="overline">
          Nodics documentation
        </Typography>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
      </Stack>
      <Divider />
      {blocks.map((block, index) => (
        <DocumentationBlockRenderer
          block={block}
          index={index}
          key={`${text(block.kind)}:${String(index)}`}
        />
      ))}
    </Stack>
  );
}
