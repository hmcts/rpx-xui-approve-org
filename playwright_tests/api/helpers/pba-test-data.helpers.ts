import { randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { loadOrganisationById, provisionActiveOrganisation, provisionPendingOrganisation } from './organisations-write.helpers';

export type PbaStatusTarget = {
  orgId: string;
  pbaNumber: string;
};

export type PbaUpdateTarget = {
  orgId: string;
  paymentAccounts: string[];
};

function generatePbaNumber(): string {
  const suffix = randomBytes(5).toString('hex').slice(0, 7).toUpperCase();
  return `PBA${suffix}`;
}

export async function resolvePbaUpdateTarget(apiRequest: APIRequestContext, paymentAccountCount: number): Promise<PbaUpdateTarget> {
  const provisioned = await provisionPendingOrganisation(apiRequest, {
    firstName: 'Pba',
    lastName: 'Setup'
  });

  return {
    orgId: provisioned.organisationId,
    paymentAccounts: Array.from({ length: paymentAccountCount }, () => generatePbaNumber())
  };
}

export async function resolvePbaStatusUpdateTarget(apiRequest: APIRequestContext): Promise<PbaStatusTarget | null> {
  const provisioned = await provisionActiveOrganisation(apiRequest, {
    firstName: 'Pba',
    lastName: 'Status',
    hasPBA: true
  });

  const organisation = await loadOrganisationById(apiRequest, provisioned.organisationId);
  const pendingPaymentAccounts = Array.isArray(organisation?.pendingPaymentAccount) ? organisation.pendingPaymentAccount : [];
  const pendingPbaNumber = pendingPaymentAccounts.find(
    (pendingPaymentAccount) =>
      typeof pendingPaymentAccount === 'string' && provisioned.pbaNumbers.includes(pendingPaymentAccount)
  );
  if (!pendingPbaNumber) {
    return null;
  }

  return {
    orgId: provisioned.organisationId,
    pbaNumber: pendingPbaNumber
  };
}
