import type { Page } from '@playwright/test';
import type { OrganisationApprovalsPage } from '../../page-objects/pages/exui/organisation-approvals.page';
import { setupOrganisationSearchIntegrationPage } from './organisation-search.helpers';
import { buildPendingPbaDecisionState } from '../test-data/pending-pba-decisions.data';

export async function openPendingPbaDecisions(
  page: Page,
  organisationApprovalsPage: OrganisationApprovalsPage,
  state = buildPendingPbaDecisionState()
): Promise<void> {
  await setupOrganisationSearchIntegrationPage(page, state);
  await organisationApprovalsPage.openNewPbasTab();
  await organisationApprovalsPage.openFirstPendingPba();
}
