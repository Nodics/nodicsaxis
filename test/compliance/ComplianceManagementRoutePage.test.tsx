import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ComplianceManagementRoutePage } from '../../src/operations/compliance/ComplianceManagementRoutePage';

describe('Compliance Management presentation', () => {
  it('renders only backend-published workspaces and explains the KYC operating model', () => {
    const navigation = {
      id: 'kyc-cases',
      moduleName: 'kycCore',
      label: 'KYC Cases',
      route: '/compliance-management/kyc/cases',
      category: 'governance',
      icon: 'case',
      order: 10,
      availability: 'UP',
      featureState: 'ACTIVE',
      parentId: 'compliance-management',
      parentModuleName: 'complianceCore',
      workbenchTarget: { moduleName: 'kycSchema', schemaName: 'kycVerificationCase' },
      requiredPermissions: [],
      perspectives: [],
      contexts: [],
    } as const;
    const bootstrap = {
      tenantCode: 't1',
      navigation: [
        navigation,
        {
          ...navigation,
          id: 'kyc-reviews',
          label: 'Review Queue',
          route: '/compliance-management/kyc/reviews',
          order: 20,
        },
      ],
      moduleConnections: {},
      axisPolicy: { recentNavigationLimit: 10 },
    } as never;
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ComplianceManagementRoutePage
            accessToken="token"
            bootstrap={bootstrap}
            channel="axis"
            cmsBaseUrl="/cms"
            employeeId="reviewer"
            locale="en"
            navigation={navigation}
            runtime={{ enterpriseCode: 'e1', requestTimeoutMs: 1000 } as never}
            site="axis"
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Compliance Management')).toBeInTheDocument();
    expect(screen.getByText('Review Queue')).toBeInTheDocument();
    expect(screen.getByText(/Submit → Checks → Review/)).toBeInTheDocument();
    expect(screen.getByText('Backend authorized')).toBeInTheDocument();
  });
});
