import type { BrowserContext, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { config } from '../config/config';

export type RegisterOrganisationInput = {
  userName: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  workEmailAddress?: string;
};

export interface PBANumberModel {
  pbaNumber: string;
  status?: string;
  statusMessage?: string;
  dateCreated?: string;
  dateAccepted?: string;
}

type RegisterOrganisationPayload = {
  companyName: string;
  companyHouseNumber: string;
  hasDxReference: boolean;
  dxNumber: string | null;
  dxExchange: string | null;
  services: Array<{ key: string; value: string }>;
  otherServices: string | null;
  hasPBA: boolean;
  contactDetails: {
    firstName: string;
    lastName: string;
    workEmailAddress: string;
  };
  address: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    postTown: string;
    county: string | null;
    country: string;
    postCode: string;
  };
  organisationType: {
    key: string;
    description: string;
  };
  otherOrganisationType: string | null;
  otherOrganisationDetail: string | null;
  regulatorRegisteredWith: string | null;
  regulators: Array<{ regulatorType: string }>;
  hasIndividualRegisteredWithRegulator: boolean;
  individualRegulators: unknown[];
  pbaNumbers: string[];
  inInternationalMode: boolean;
  sraRegulated: boolean;
};

function generatePBANumbers(count: number = 3): PBANumberModel[] {
  return Array.from({ length: count }, () => ({
    pbaNumber: `PBA${faker.string.numeric({ length: 7, allowLeadingZeros: true })}`
  }));
}

function buildRegisterOrganisationPayload(input: RegisterOrganisationInput): RegisterOrganisationPayload {
  const companyName = input.companyName ?? `${input.userName}`;
  const workEmailAddress = input.workEmailAddress ?? `${input.userName}@mailinator.com`;
  const firstName = input.firstName ?? 'Test';
  const lastName = input.lastName ?? 'User';
  const pbaNumbers = generatePBANumbers(2);
  const addressLine1Seed = faker.string.numeric({ length: 4, allowLeadingZeros: true });
  const dxNumber = `DX ${faker.string.numeric({ length: 10, allowLeadingZeros: true })}`;
  const dxExchange = faker.string.numeric({ length: 18, allowLeadingZeros: true });

  return {
    companyName,
    companyHouseNumber: faker.string.numeric({ length: 8, allowLeadingZeros: true }),
    hasDxReference: false,
    dxNumber,
    dxExchange,
    services: [{ key: 'AAA7', value: 'Damages' }],
    otherServices: null,
    hasPBA: false,
    contactDetails: {
      firstName,
      lastName,
      workEmailAddress
    },
    address: {
      addressLine1: `${addressLine1Seed} high road`,
      addressLine2: `RDPerf${firstName} ${lastName}`,
      addressLine3: 'Maharaj road',
      postTown: 'West Kirby',
      county: 'Wirral',
      country: 'UK',
      postCode: 'EC1A 1BB'
    },
    organisationType: {
      key: 'SOLICITOR',
      description: 'Solicitor'
    },
    otherOrganisationType: null,
    otherOrganisationDetail: null,
    regulatorRegisteredWith: null,
    regulators: [{ regulatorType: 'Not Applicable' }],
    hasIndividualRegisteredWithRegulator: false,
    individualRegulators: [],
    pbaNumbers: pbaNumbers.map((pba) => pba.pbaNumber),
    inInternationalMode: false,
    sraRegulated: true
  };
}

async function getXsrfToken(context: BrowserContext, url: string): Promise<string> {
  const cookies = await context.cookies(url);
  const xsrfToken = cookies.find((cookie) => cookie.name === 'XSRF-TOKEN')?.value;
  if (!xsrfToken) {
    throw new Error(`XSRF token cookie is missing for ${url}`);
  }
  return xsrfToken;
}

export async function registerOrganisationViaExternalEndpoint(page: Page, input: RegisterOrganisationInput): Promise<void> {
  const registerPageUrl = new URL('/register-org-new/register', config.registerUrl).toString();
  const registerApiUrl = new URL('/external/register-org-new/register', config.registerUrl).toString();
  const origin = new URL(config.registerUrl).origin;

  await page.goto(registerPageUrl, { waitUntil: 'domcontentloaded' });
  const xsrfToken = await getXsrfToken(page.context(), registerPageUrl);
  const payload = buildRegisterOrganisationPayload(input);

  const response = await page.request.post(registerApiUrl, {
    failOnStatusCode: false,
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      'x-xsrf-token': xsrfToken,
      origin,
      referer: `${origin}/`
    },
    data: payload
  });

  if (!response.ok()) {
    const responseBody = await response.text().catch(() => 'Unable to read response body');
    throw new Error(`Register organisation request failed (${response.status()}): ${responseBody}`);
  }
}
export async function createDXNumber() {
  const randomDX = Math.floor(Math.random() * 9000000000) + 1000000000;
  return randomDX.toString();
}

export async function createDXENumber() {
  const randomDXE = Math.floor(Math.random() * 9000000000) + 1000000000;
  return randomDXE.toString();
}

export async function createSRANumber() {
  const ramdomSRA = Math.floor(Math.random() * 9000000000) + 1000000000;
  return ramdomSRA.toString();
}
