/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function requireClauses(relativePath: string, clauses: string[]): void {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const clause of clauses) {
    expect(content, `${relativePath} must preserve: ${clause}`).toContain(clause);
  }
}

describe('Axis distributed implementation documentation', () => {
  it('keeps partial-discovery and repository ownership rules enforceable', () => {
    requireClauses('AGENTS.md', [
      'Design Axis for partial discovery',
      'successful, unauthorized',
      'business-user, administrator, backend contract',
      'CMS-delivered component properties as the authority',
      'Never localize by parsing English error text',
      'Backend-driven presentation remains declarative and non-executable',
    ]);
    requireClauses('docs/implementation-and-documentation-contract.md', [
      '## Local Discovery Chain',
      '## Repository Ownership',
      '## Placement Rules',
      '## Required Feature Documentation',
      '### Successful',
      '### Unauthorized',
      '### Boundary',
      '### Failure And Recovery',
      '### Customization',
      'Configurable page copy comes from CMS component properties',
      'Locale, channel, and backend-resolved fallback',
      '## Acceptance',
    ]);
    requireClauses('docs/feature-delivery-checklist.md', [
      '## 7. Partial-discovery and use-case proof',
      'successful, unauthorized/invalid, boundary/responsive',
      'Link Nodics-owned business and backend guidance',
      'long translated labels, right-to-left direction',
    ]);
  });
});
