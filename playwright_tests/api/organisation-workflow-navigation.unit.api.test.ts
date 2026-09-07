import { expect, test } from '@playwright/test';
import { organisationDetailsUrl } from '../helpers/organisation-workflow-navigation';

test('builds a direct organisation-details route for a provisioned identifier', () => {
  const detailsUrl = organisationDetailsUrl('ORG/ 123');

  expect(detailsUrl).toMatch(/\/organisation-details\/ORG%2F%20123$/);
});
