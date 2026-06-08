import { test } from '../page-objects/page.fixtures';
import { config } from '../config/config';
import { ensureAuthenticatedPage } from '../helpers/sessionCapture';

test('shows the PBA validation error when approving an invalid new PBA', async ({ page, organisationApprovalsPage }) => {
  await ensureAuthenticatedPage(page, 'base', { baseUrl: config.baseUrl });
  await organisationApprovalsPage.approveFirstInvalidPbaAndExpectValidationError();
});
