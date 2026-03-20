import { test } from '../../fixtures';

test('i can approve a pending org', async ({ organisationApprovalsPage, organisationDetailsPage, organisationId, organisationName }) => {
  await organisationApprovalsPage.signIn();
  await organisationApprovalsPage.openPendingOrganisation(organisationId, organisationName);
  await organisationDetailsPage.expectPendingDecisionPage();
  await organisationDetailsPage.submitDecision('Approve it', /SUCCESS\s*Registration approved/i);
});

test('i can reject a pending org', async ({ organisationApprovalsPage, organisationDetailsPage, organisationId }) => {
  await organisationApprovalsPage.signIn();
  await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
  await organisationDetailsPage.expectPendingDecisionPage();
  await organisationDetailsPage.submitDecision('Reject it', /SUCCESS\s*Registration rejected/i);
});

test('i can place registration under review for a pending org', async ({
  organisationApprovalsPage,
  organisationDetailsPage,
  organisationId
}) => {
  await organisationApprovalsPage.signIn();
  await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
  await organisationDetailsPage.expectPendingDecisionPage();
  await organisationDetailsPage.submitDecision('Place registration under', /SUCCESS\s*Registration put under/i);
});

test('i can delete an active org', async ({ organisationApprovalsPage, organisationDetailsPage, organisationId, organisationName }) => {
  await organisationApprovalsPage.signIn();
  await organisationApprovalsPage.openOrganisationDetailsById(organisationId);
  await organisationDetailsPage.expectPendingDecisionPage();
  await organisationDetailsPage.submitDecision('Approve it', /SUCCESS\s*Registration approved/i);

  await organisationApprovalsPage.openActiveOrganisation(organisationName);
  await organisationDetailsPage.expectDeleteReady();
  await organisationDetailsPage.deleteOrganisation(organisationName);
});
