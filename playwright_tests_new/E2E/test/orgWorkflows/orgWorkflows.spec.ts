import { orgWorkflowTest as test } from '../../fixtures';
import { waitForOrganisationStatus } from '../../utils/test-setup/organisationSetup';

test.describe('org workflows', () => {
  // The AAT-backed registration and approval journeys are stateful and
  // environment-sensitive, so these specs must not fan out across workers.
  test.describe.configure({ mode: 'serial' });

  test('i can approve a pending org', async ({
    organisationApprovalsPage,
    organisationDetailsPage,
    organisationId,
    organisationName,
  }) => {
    await organisationApprovalsPage.openPendingOrganisation(organisationId, organisationName);
    await organisationDetailsPage.expectPendingDecisionPage();
    await organisationDetailsPage.submitDecision('Approve it', /SUCCESS\s*Registration approved/i);
  });

  test('i can reject a pending org', async ({ organisationApprovalsPage, organisationDetailsPage, organisationId }) => {
    await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
    await organisationDetailsPage.expectPendingDecisionPage();
    await organisationDetailsPage.submitDecision('Reject it', /SUCCESS\s*Registration rejected/i);
  });

  test('i can place registration under review for a pending org', async ({
    organisationApprovalsPage,
    organisationDetailsPage,
    organisationId,
  }) => {
    await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
    await organisationDetailsPage.expectPendingDecisionPage();
    await organisationDetailsPage.submitDecision('Place registration under', /SUCCESS\s*Registration put under/i);
  });

  test('i can delete an active org', async ({
    page,
    organisationApprovalsPage,
    organisationDetailsPage,
    organisationId,
    organisationName,
  }) => {
    await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
    await organisationDetailsPage.expectPendingDecisionPage();
    await organisationDetailsPage.submitDecision('Approve it', /SUCCESS\s*Registration approved/i);

    const activeOrganisationId = await waitForOrganisationStatus(page, organisationName, 'ACTIVE');
    await organisationDetailsPage.openUntilDeleteReady(activeOrganisationId);
    await organisationDetailsPage.deleteOrganisation(organisationName);
  });
});
