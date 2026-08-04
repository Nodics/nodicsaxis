import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { OrderLifecycleManagementRoutePage } from '../../src/operations/orderLifecycle/OrderLifecycleManagementRoutePage';
import { orderLifecycleGuidance } from '../../src/operations/orderLifecycle/orderLifecycleGuidance';

describe('Order Lifecycle Management presentation', () => {
  it('shows only backend-published lifecycle workspaces and owner boundaries', () => {
    const navigation = {
      id: 'order-refunds',
      moduleName: 'order',
      label: 'Refund Cases',
      route: '/commerce/refunds',
      category: 'commerce',
      icon: 'receipt',
      parentId: 'checkout',
      order: 20,
      availability: 'UP',
      featureState: 'ACTIVE',
      workbenchTarget: { moduleName: 'order', schemaName: 'orderRefundRequest' },
      requiredPermissions: ['order.refund.support.read'],
      perspectives: [],
      contexts: [],
    } as const;
    const returns = {
      ...navigation,
      id: 'order-returns',
      label: 'Return RMAs',
      route: '/commerce/returns',
      order: 10,
      workbenchTarget: { moduleName: 'order', schemaName: 'orderReturnRequest' },
    } as const;
    const unrelated = {
      ...navigation,
      id: 'orders',
      label: 'Orders',
      route: '/commerce/orders',
      order: 1,
      workbenchTarget: { moduleName: 'order', schemaName: 'order' },
    } as const;
    const payment = {
      ...navigation,
      id: 'payment-refunds-reconciliation',
      moduleName: 'payment',
      label: 'Refunds & Reconciliation',
      route: '/commerce/payments/refunds-reconciliation',
      parentId: 'payment-operations',
      order: 30,
      workbenchTarget: { moduleName: 'payment', schemaName: 'paymentTransaction' },
    } as const;
    const bootstrap = {
      tenantCode: 'tenant1',
      navigation: [navigation, returns, unrelated, payment],
      moduleConnections: {},
      axisPolicy: { recentNavigationLimit: 10 },
    } as never;
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <OrderLifecycleManagementRoutePage
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
    expect(screen.getByText('Order Lifecycle Management')).toBeInTheDocument();
    expect(screen.getByText('Return RMAs')).toBeInTheDocument();
    expect(screen.queryByText('Orders')).not.toBeInTheDocument();
    expect(screen.queryByText('Refunds & Reconciliation')).not.toBeInTheDocument();
    expect(screen.getAllByText(/original-rail allocations/)).toHaveLength(2);
    expect(screen.getByText('Backend authorized')).toBeInTheDocument();
  });

  it('scopes Commerce shortcuts to the active backend navigation hierarchy', () => {
    const paymentOperations = {
      id: 'payment-operations',
      moduleName: 'payment',
      label: 'Payment Operations',
      route: '/commerce/payments',
      category: 'commerce',
      icon: 'payment',
      order: 10,
      availability: 'UP',
      featureState: 'ACTIVE',
      group: { id: 'commerce', label: 'Commerce', order: 300 },
      workbenchTarget: { moduleName: 'payment', schemaName: 'paymentTransaction' },
      requiredPermissions: ['payment.backoffice.read'],
      perspectives: [],
      contexts: [],
    } as const;
    const paymentRefunds = {
      ...paymentOperations,
      id: 'payment-refunds-reconciliation',
      label: 'Refunds & Reconciliation',
      route: '/commerce/payments/refunds-reconciliation',
      parentId: 'payment-operations',
      order: 11,
    } as const;
    const paymentMethods = {
      ...paymentRefunds,
      id: 'payment-methods',
      label: 'Payment Methods',
      route: '/commerce/payments/methods',
      order: 12,
      workbenchTarget: { moduleName: 'payment', schemaName: 'paymentMethod' },
    } as const;
    const orderReturns = {
      ...paymentRefunds,
      id: 'returns',
      moduleName: 'order',
      label: 'Returns',
      route: '/commerce/operations/checkout/returns',
      parentId: 'checkout',
      order: 20,
      workbenchTarget: { moduleName: 'order', schemaName: 'orderReturnRequest' },
    } as const;
    const catalog = {
      ...paymentOperations,
      id: 'catalog-and-products',
      moduleName: 'product',
      label: 'Catalog & Products',
      route: '/commerce/operations/catalog',
      order: 30,
      workbenchTarget: { moduleName: 'product', schemaName: 'productItem' },
    } as const;
    const products = {
      ...catalog,
      id: 'products',
      label: 'Products',
      route: '/commerce/operations/catalog/products',
      parentId: 'catalog-and-products',
      order: 31,
    } as const;
    const bootstrap = {
      tenantCode: 'tenant1',
      navigation: [
        paymentOperations,
        paymentRefunds,
        paymentMethods,
        orderReturns,
        catalog,
        products,
      ],
      moduleConnections: {},
      axisPolicy: { recentNavigationLimit: 10 },
    } as never;

    const { rerender } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <OrderLifecycleManagementRoutePage
            accessToken="token"
            bootstrap={bootstrap}
            channel="axis"
            cmsBaseUrl="/cms"
            employeeId="operator"
            locale="en"
            navigation={paymentOperations}
            runtime={{ enterpriseCode: 'enterprise1', requestTimeoutMs: 1000 } as never}
            site="axis"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText('Payment Operations').length).toBeGreaterThan(0);
    expect(screen.getByText('Refunds & Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.queryByText('Returns')).not.toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <OrderLifecycleManagementRoutePage
            accessToken="token"
            bootstrap={bootstrap}
            channel="axis"
            cmsBaseUrl="/cms"
            employeeId="operator"
            locale="en"
            navigation={catalog}
            runtime={{ enterpriseCode: 'enterprise1', requestTimeoutMs: 1000 } as never}
            site="axis"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Catalog & Product Management')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.queryByText('Refunds & Reconciliation')).not.toBeInTheDocument();
    expect(screen.getByText('No catalog-only refund action')).toBeInTheDocument();
  });

  it('explains distinct cancellation, Return and Refund decisions', () => {
    expect(orderLifecycleGuidance('orderCancellationRequest')).toContain(
      'settlement impact',
    );
    expect(orderLifecycleGuidance('orderReturnRequest')).toContain('Fulfillment owns');
    expect(orderLifecycleGuidance('orderRefundRequest')).toContain('maker-checker');
  });
});
