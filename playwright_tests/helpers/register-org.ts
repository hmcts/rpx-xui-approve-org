import type { BrowserContext, Page } from '@playwright/test';
import { config } from '../config/config';

export type RegisterOrganisationInput = {
  userName: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  workEmailAddress?: string;
};

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

function buildRegisterOrganisationPayload(input: RegisterOrganisationInput): RegisterOrganisationPayload {
  const companyName = input.companyName ?? `${input.userName}`;
  const workEmailAddress = input.workEmailAddress ?? `${input.userName}@mailinator.com`;

  return {
    companyName,
    companyHouseNumber: '123456',
    hasDxReference: false,
    dxNumber: 'DX321',
    dxExchange: 'DX Exchange',
    services: [{ key: 'AAA7', value: 'Damages' }],
    otherServices: null,
    hasPBA: false,
    contactDetails: {
      firstName: input.firstName ?? 'Test',
      lastName: input.lastName ?? 'User',
      workEmailAddress
    },
    address: {
      addressLine1: 'Royal Mail, Mount Pleasant Mail Centre',
      addressLine2: 'Farringdon Road',
      addressLine3: '',
      postTown: 'London',
      county: 'GreaterLondon',
      country: 'United Kingdom',
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
    pbaNumbers: ['PBA8NMHAFU'],
    inInternationalMode: false,
    sraRegulated: false
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
