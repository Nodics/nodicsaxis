import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { NotificationManagementRoutePage } from '../../src/operations/notifications/NotificationManagementRoutePage';

describe('Notification Management presentation', () => {
  it('renders only backend-published workspaces and business lifecycle guidance', () => {
    const navigation = {
      id: 'notify-deliveries',
      moduleName: 'notifyCore',
      label: 'Delivery Logs',
      route: '/notifications/delivery-logs',
      category: 'operations',
      icon: 'receipt',
      order: 10,
      availability: 'UP',
      featureState: 'ACTIVE',
      workbenchTarget: {
        moduleName: 'notifySchema',
        schemaName: 'notifyDeliveryRequest',
      },
      requiredPermissions: [],
      perspectives: [],
      contexts: [],
    } as const;
    const testConsole = {
      ...navigation,
      id: 'notify-test-console',
      label: 'Test Console',
      route: '/notifications/test-console',
      order: 20,
      workbenchTarget: { moduleName: 'notifySchema', schemaName: 'notifyTemplate' },
    } as const;
    const hidden = {
      ...navigation,
      id: 'other',
      label: 'Other capability',
      route: '/other',
      order: 30,
    } as const;
    const bootstrap = {
      tenantCode: 'tenant1',
      navigation: [navigation, testConsole, hidden],
      moduleConnections: {},
      axisPolicy: { recentNavigationLimit: 10 },
    } as never;
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <NotificationManagementRoutePage
            accessToken="token"
            bootstrap={bootstrap}
            channel="axis"
            cmsBaseUrl="/cms"
            employeeId="operator"
            locale="en"
            navigation={navigation}
            runtime={{ enterpriseCode: 'enterprise1', requestTimeoutMs: 1000 } as never}
            site="axis"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Notifications & Messaging')).toBeInTheDocument();
    expect(screen.getByText('Test Console')).toBeInTheDocument();
    expect(screen.queryByText('Other capability')).not.toBeInTheDocument();
    expect(screen.getAllByText(/normalized provider outcome/)).toHaveLength(2);
    expect(screen.getByText('Safe evidence only')).toBeInTheDocument();
  });
});
