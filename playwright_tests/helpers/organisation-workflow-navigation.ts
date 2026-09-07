import type { Page } from '@playwright/test';
import { config } from '../config/config';
import { ensureAuthenticatedPageAt } from './sessionCapture';

export function organisationDetailsUrl(organisationIdentifier: string): string {
  return new URL(`/organisation-details/${encodeURIComponent(organisationIdentifier)}`, config.baseUrl).toString();
}

export async function openProvisionedOrganisationDetails(page: Page, organisationIdentifier: string): Promise<void> {
  await ensureAuthenticatedPageAt(page, organisationDetailsUrl(organisationIdentifier));
}
