import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ModuleHealthSummary } from '../../../src/operations/moduleHealth/api/moduleHealthContracts';
import { ModuleHealthTree } from '../../../src/operations/moduleHealth/ModuleHealthTree';

const availability = {
  state: 'UP' as const,
  activeInstances: 1,
  healthyInstances: 1,
  unavailableInstances: 0,
  unknownInstances: 0,
};
const modules: readonly ModuleHealthSummary[] = [
  {
    moduleName: 'gCore',
    displayName: 'Core Capabilities',
    moduleKind: 'group',
    environments: ['startioLocal'],
    servers: ['monoServer'],
    availability,
  },
  {
    moduleName: 'profile',
    displayName: 'Profile and Identity',
    parentModule: 'gCore',
    canonicalIdentity: 'nodics/gCore/profile',
    moduleKind: 'capability',
    environments: ['startioLocal'],
    servers: ['monoServer'],
    availability,
  },
];

describe('ModuleHealthTree', () => {
  it('renders loader-owned hierarchy, toggles groups, and selects only concrete modules', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <ModuleHealthTree
        modules={modules}
        onSelect={onSelect}
        search=""
        stateColor={() => 'success'}
      />,
    );

    expect(screen.getByText('Core Capabilities')).toBeVisible();
    expect(screen.getByText('Profile and Identity')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Collapse Core Capabilities' }),
    );
    expect(screen.queryByText('Profile and Identity')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand Core Capabilities' }));
    await user.click(screen.getByText('Profile and Identity'));
    expect(onSelect).toHaveBeenCalledWith('profile');
  });

  it('keeps an ancestor visible when a descendant canonical path matches search', () => {
    render(
      <ModuleHealthTree
        modules={modules}
        onSelect={() => undefined}
        search="nodics/gCore/profile"
        stateColor={() => 'success'}
      />,
    );

    expect(screen.getByText('Core Capabilities')).toBeVisible();
    expect(screen.getByText('Profile and Identity')).toBeVisible();
  });
});
