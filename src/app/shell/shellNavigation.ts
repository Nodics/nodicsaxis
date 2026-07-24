import type {
  AxisModuleAvailability,
  AxisNavigationItem,
} from '../../bootstrap/publicBootstrap';

export interface ShellNavigationItem extends AxisNavigationItem {
  readonly local: boolean;
}

export interface ShellNavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly order: number;
  readonly items: readonly ShellNavigationItem[];
}

const CATEGORY_GROUPS: Readonly<
  Record<string, Pick<ShellNavigationGroup, 'id' | 'label' | 'order'>>
> = Object.freeze({
  content: { id: 'content', label: 'Content and Experience', order: 200 },
  experience: { id: 'content', label: 'Content and Experience', order: 200 },
  commerce: { id: 'commerce', label: 'Commerce', order: 300 },
  core: {
    id: 'organization',
    label: 'Organization',
    order: 400,
  },
  operations: {
    id: 'automation',
    label: 'Automation',
    order: 500,
  },
  platform: {
    id: 'operations',
    label: 'Operations',
    order: 600,
  },
});

const dashboard: ShellNavigationItem = Object.freeze({
  id: 'dashboard',
  label: 'Dashboard',
  route: '/dashboard',
  order: 0,
  moduleName: 'axis',
  category: 'workspace',
  icon: 'dashboard',
  availability: 'UP',
  local: true,
});

export function composeShellNavigation(
  navigation: readonly AxisNavigationItem[],
): readonly ShellNavigationGroup[] {
  const groups = new Map<string, ShellNavigationGroup>();
  groups.set('workspace', {
    id: 'workspace',
    label: 'Workspace',
    order: 100,
    items: [dashboard],
  });

  navigation.forEach((item) => {
    const definition = CATEGORY_GROUPS[item.category] ?? {
      id: 'other',
      label: 'Other Capabilities',
      order: 700,
    };
    const existing = groups.get(definition.id);
    const shellItem: ShellNavigationItem = { ...item, local: false };
    groups.set(definition.id, {
      ...definition,
      items: [...(existing?.items ?? []), shellItem],
    });
  });

  return Object.freeze(
    [...groups.values()]
      .map((group) => ({
        ...group,
        items: Object.freeze(
          [...group.items].sort(
            (left, right) =>
              left.order - right.order || left.label.localeCompare(right.label),
          ),
        ),
      }))
      .sort((left, right) => left.order - right.order),
  );
}

export function availabilityLabel(state: AxisModuleAvailability): string {
  switch (state) {
    case 'UP':
      return 'Available';
    case 'DEGRADED':
      return 'Degraded';
    case 'UNAVAILABLE':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}
