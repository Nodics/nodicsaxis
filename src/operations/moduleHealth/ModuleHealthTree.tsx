import {
  Box,
  CardActionArea,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import type { AxisModuleAvailability } from '../../bootstrap/publicBootstrap';
import type { ModuleHealthSummary } from './api/moduleHealthContracts';

interface ModuleHealthTreeProps {
  readonly modules: readonly ModuleHealthSummary[];
  readonly search: string;
  readonly selectedModule?: string | undefined;
  readonly onSelect: (moduleName: string) => void;
  readonly stateColor: (
    state: AxisModuleAvailability,
  ) => 'success' | 'warning' | 'error' | 'default';
}

interface ModuleHealthTreeNode {
  readonly module: ModuleHealthSummary;
  readonly children: readonly ModuleHealthTreeNode[];
}

function buildTree(
  modules: readonly ModuleHealthSummary[],
): readonly ModuleHealthTreeNode[] {
  const children = new Map<string | undefined, ModuleHealthSummary[]>();
  const known = new Set(modules.map((module) => module.moduleName));
  modules.forEach((module) => {
    const parent =
      module.parentModule && known.has(module.parentModule)
        ? module.parentModule
        : undefined;
    children.set(parent, [...(children.get(parent) ?? []), module]);
  });
  const visit = (parent: string | undefined): readonly ModuleHealthTreeNode[] =>
    (children.get(parent) ?? [])
      .sort((left, right) =>
        (left.displayName ?? left.moduleName).localeCompare(
          right.displayName ?? right.moduleName,
        ),
      )
      .map((module) => ({
        module,
        children: visit(module.moduleName),
      }));
  return visit(undefined);
}

function matches(node: ModuleHealthTreeNode, needle: string): boolean {
  if (!needle) return true;
  return (
    [
      node.module.moduleName,
      node.module.displayName,
      node.module.canonicalIdentity,
      node.module.version,
      ...node.module.environments,
      ...node.module.servers,
      node.module.availability.state,
    ].some((value) => value?.toLocaleLowerCase().includes(needle)) ||
    node.children.some((child) => matches(child, needle))
  );
}

function TreeNode(props: {
  readonly node: ModuleHealthTreeNode;
  readonly depth: number;
  readonly needle: string;
  readonly selectedModule?: string | undefined;
  readonly collapsed: ReadonlySet<string>;
  readonly onToggle: (moduleName: string) => void;
  readonly onSelect: (moduleName: string) => void;
  readonly stateColor: ModuleHealthTreeProps['stateColor'];
}) {
  const isGroup =
    props.node.children.length > 0 || props.node.module.moduleKind === 'group';
  const expanded =
    props.needle !== '' || !props.collapsed.has(props.node.module.moduleName);
  if (!matches(props.node, props.needle)) return null;
  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          bgcolor:
            props.selectedModule === props.node.module.moduleName
              ? 'action.selected'
              : undefined,
          pl: 0.5 + props.depth * 2,
        }}
      >
        {isGroup ? (
          <IconButton
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${props.node.module.displayName ?? props.node.module.moduleName}`}
            onClick={() => props.onToggle(props.node.module.moduleName)}
            size="small"
          >
            <Box component="span" sx={{ fontSize: '0.85rem' }}>
              {expanded ? '▾' : '▸'}
            </Box>
          </IconButton>
        ) : (
          <Box sx={{ width: 34 }} />
        )}
        <CardActionArea
          disabled={isGroup}
          onClick={() => props.onSelect(props.node.module.moduleName)}
          sx={{ borderRadius: 1, px: 1, py: 1.25 }}
        >
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: isGroup ? 800 : 600 }}>
                {props.node.module.displayName ?? props.node.module.moduleName}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {props.node.module.availability.healthyInstances} of{' '}
                {props.node.module.availability.activeInstances} instances ready
              </Typography>
            </Box>
            <Chip
              color={props.stateColor(props.node.module.availability.state)}
              label={props.node.module.availability.state}
              size="small"
            />
          </Stack>
        </CardActionArea>
      </Stack>
      {isGroup ? (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {props.node.children.map((child) => (
            <TreeNode
              {...props}
              depth={props.depth + 1}
              key={child.module.moduleName}
              node={child}
            />
          ))}
        </Collapse>
      ) : null}
      {props.depth === 0 ? <Divider /> : null}
    </>
  );
}

export function ModuleHealthTree(props: ModuleHealthTreeProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const tree = useMemo(() => buildTree(props.modules), [props.modules]);
  const needle = props.search.trim().toLocaleLowerCase();
  return (
    <Stack spacing={0}>
      {tree.map((node) => (
        <TreeNode
          collapsed={collapsed}
          depth={0}
          key={node.module.moduleName}
          needle={needle}
          node={node}
          onSelect={props.onSelect}
          onToggle={(moduleName) =>
            setCollapsed((current) => {
              const next = new Set(current);
              if (next.has(moduleName)) next.delete(moduleName);
              else next.add(moduleName);
              return next;
            })
          }
          selectedModule={props.selectedModule}
          stateColor={props.stateColor}
        />
      ))}
    </Stack>
  );
}
