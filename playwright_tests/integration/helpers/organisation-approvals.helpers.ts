import type { Page } from '@playwright/test';
import { ensureAuthenticatedPage } from '../../helpers/sessionCapture';
import { OrganisationApprovalsPage } from '../../page-objects/pages';

export async function openOrganisationApprovalsPage(page: Page): Promise<OrganisationApprovalsPage> {
  await ensureAuthenticatedPage(page, 'base');
  return new OrganisationApprovalsPage(page);
}
