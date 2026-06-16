import { request as playwrightRequest } from '@playwright/test';
import type { APIRequestContext, BrowserContext, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { config } from '../config/config';

export type RegisterOrganisationInput = {
  userName: string;
  companyName?: string;
  companyHouseNumber?: string | null;
  firstName?: string;
  lastName?: string;
  workEmailAddress?: string;
  hasDxReference?: boolean;
  dxNumber?: string | null;
  dxExchange?: string | null;
  services?: OrganisationService[];
  otherServices?: string | null;
  hasPBA?: boolean;
  pbaNumbers?: string[];
  address?: Partial<RegisterOrganisationAddress>;
  organisationType?: OrganisationType;
  otherOrganisationType?: OrganisationType | null;
  otherOrganisationDetail?: string | null;
  regulatorRegisteredWith?: string | null;
  regulators?: Regulator[];
  hasIndividualRegisteredWithRegulator?: boolean;
  individualRegulators?: Regulator[];
  inInternationalMode?: boolean;
  sraRegulated?: boolean;
};

export type RegisterOrganisationResult = {
  organisationIdentifier?: string;
  pbaNumbers: string[];
};

type OrganisationService = {
  key: string;
  value: string;
};

type OrganisationType = {
  key: string;
  description: string;
};

type Regulator = {
  regulatorType: string;
  regulatorName?: string;
  organisationRegistrationNumber?: string;
};

type RegisterOrganisationAddress = {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  postTown: string;
  county: string | null;
  country: string;
  postCode: string;
};

type RegisterOrganisationPayload = {
  companyName: string;
  companyHouseNumber: string | null;
  hasDxReference: boolean;
  dxNumber: string | null;
  dxExchange: string | null;
  services: OrganisationService[];
  otherServices: string | null;
  hasPBA: boolean;
  contactDetails: {
    firstName: string;
    lastName: string;
    workEmailAddress: string;
  };
  address: RegisterOrganisationAddress;
  organisationType: OrganisationType;
  otherOrganisationType: OrganisationType | null;
  otherOrganisationDetail: string | null;
  regulatorRegisteredWith: string | null;
  regulators: Regulator[];
  hasIndividualRegisteredWithRegulator: boolean;
  individualRegulators: Regulator[];
  pbaNumbers: string[];
  inInternationalMode: boolean;
  sraRegulated: boolean;
};

type RegisterOrganisationResponseBody = {
  organisationIdentifier?: unknown;
  [key: string]: unknown;
};

const DEFAULT_ORGANISATION_TYPE: OrganisationType = {
  key: 'SolicitorOrganisation',
  description: 'Solicitor Organisation'
};
const DEFAULT_SERVICES: OrganisationService[] = [{ key: 'AAA7', value: 'Damages' }];
const DEFAULT_REGULATORS: Regulator[] = [{ regulatorType: 'Not Applicable' }];
const SRA_REGULATOR_TYPE = 'Solicitor Regulation Authority (SRA)';
const PBA_NUMBER_PATTERN = /^(?:PBA|pba)\d{7}$/;

function generatePBANumbers(count: number = 2): string[] {
  const pbaNumbers = new Set<string>();

  while (pbaNumbers.size < count) {
    const pbaNumber = `PBA${faker.string.numeric({ length: 7, allowLeadingZeros: true })}`;

    if (!PBA_NUMBER_PATTERN.test(pbaNumber)) {
      throw new Error(`Invalid PBA number generated: ${pbaNumber}. Expected format PBA/pba followed by 7 digits.`);
    }

    pbaNumbers.add(pbaNumber);
  }

  return Array.from(pbaNumbers);
}

function resolvePBANumbers(input: RegisterOrganisationInput): string[] {
  const pbaNumbers = input.pbaNumbers ?? generatePBANumbers();
  for (const pbaNumber of pbaNumbers) {
    if (!PBA_NUMBER_PATTERN.test(pbaNumber)) {
      throw new Error(`Invalid PBA number: ${pbaNumber}. Expected format PBA/pba followed by 7 digits.`);
    }
  }

  return pbaNumbers.map((pbaNumber) => pbaNumber.toUpperCase());
}

function buildAddress(input: RegisterOrganisationInput, firstName: string, lastName: string): RegisterOrganisationAddress {
  const addressLine1Seed = faker.string.numeric({ length: 4, allowLeadingZeros: true });

  return {
    addressLine1: input.address?.addressLine1 ?? `${addressLine1Seed} high road`,
    addressLine2: input.address?.addressLine2 ?? `RDPerf${firstName} ${lastName}`,
    addressLine3: input.address?.addressLine3 ?? 'Maharaj road',
    postTown: input.address?.postTown ?? 'West Kirby',
    county: input.address?.county ?? 'Wirral',
    country: input.address?.country ?? 'UK',
    postCode: input.address?.postCode ?? 'EC1A 1BB'
  };
}

function resolveHasDxReference(input: RegisterOrganisationInput): boolean {
  return input.hasDxReference ?? Boolean(input.dxNumber || input.dxExchange);
}

function resolveDxNumber(input: RegisterOrganisationInput, hasDxReference: boolean): string | null {
  if (!hasDxReference) {
    return null;
  }

  return input.dxNumber === undefined
    ? `DX ${faker.string.numeric({ length: 10, allowLeadingZeros: true })}`
    : input.dxNumber;
}

function resolveDxExchange(input: RegisterOrganisationInput, hasDxReference: boolean): string | null {
  if (!hasDxReference) {
    return null;
  }

  return input.dxExchange === undefined
    ? faker.string.numeric({ length: 18, allowLeadingZeros: true })
    : input.dxExchange;
}

function isSraRegulated(regulators: Regulator[]): boolean {
  return regulators.some((regulator) =>
    regulator.regulatorType === SRA_REGULATOR_TYPE &&
    Boolean(regulator.organisationRegistrationNumber)
  );
}

function buildRegisterOrganisationPayload(input: RegisterOrganisationInput): RegisterOrganisationPayload {
  const companyName = input.companyName ?? `${input.userName}`;
  const workEmailAddress = input.workEmailAddress ?? `${input.userName}@example.com`;
  const firstName = input.firstName ?? 'Test';
  const lastName = input.lastName ?? 'User';
  const hasPBA = input.hasPBA ?? Boolean(input.pbaNumbers?.length);
  const pbaNumbers = hasPBA ? resolvePBANumbers(input) : [];
  const hasDxReference = resolveHasDxReference(input);
  const regulators = input.regulators ?? DEFAULT_REGULATORS;

  return {
    companyName,
    companyHouseNumber: input.companyHouseNumber === undefined
      ? faker.string.numeric({ length: 8, allowLeadingZeros: true })
      : input.companyHouseNumber,
    hasDxReference,
    dxNumber: resolveDxNumber(input, hasDxReference),
    dxExchange: resolveDxExchange(input, hasDxReference),
    services: input.services ?? DEFAULT_SERVICES,
    otherServices: input.otherServices ?? null,
    hasPBA,
    contactDetails: {
      firstName,
      lastName,
      workEmailAddress
    },
    address: buildAddress(input, firstName, lastName),
    organisationType: input.organisationType ?? DEFAULT_ORGANISATION_TYPE,
    otherOrganisationType: input.otherOrganisationType ?? null,
    otherOrganisationDetail: input.otherOrganisationDetail ?? null,
    regulatorRegisteredWith: input.regulatorRegisteredWith ?? null,
    regulators,
    hasIndividualRegisteredWithRegulator: input.hasIndividualRegisteredWithRegulator ?? false,
    individualRegulators: input.individualRegulators ?? [],
    pbaNumbers,
    inInternationalMode: input.inInternationalMode ?? false,
    sraRegulated: input.sraRegulated ?? isSraRegulated(regulators)
  };
}

function parseRegisterOrganisationResponseBody(rawBody: string): RegisterOrganisationResponseBody | null {
  if (!rawBody.trim()) {
    return null;
  }

  try {
    const payload = JSON.parse(rawBody) as RegisterOrganisationResponseBody;
    return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : null;
  } catch {
    return null;
  }
}

function buildRegisterOrganisationResult(payload: RegisterOrganisationPayload, rawBody: string): RegisterOrganisationResult {
  const responsePayload = parseRegisterOrganisationResponseBody(rawBody);
  const organisationIdentifier = responsePayload?.organisationIdentifier;

  return {
    organisationIdentifier: typeof organisationIdentifier === 'string' ? organisationIdentifier : undefined,
    pbaNumbers: payload.pbaNumbers
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

function parseCookieValue(setCookieHeader: string, cookieName: string): string | null {
  const parts = setCookieHeader.split(';');
  const [nameAndValue] = parts;
  if (!nameAndValue) {
    return null;
  }

  const separatorIndex = nameAndValue.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const name = nameAndValue.slice(0, separatorIndex).trim();
  if (name !== cookieName) {
    return null;
  }

  return nameAndValue.slice(separatorIndex + 1);
}

function getXsrfTokenFromSetCookieHeaders(setCookieHeaders: string[], url: string): string {
  for (const setCookieHeader of setCookieHeaders) {
    const value = parseCookieValue(setCookieHeader, 'XSRF-TOKEN');
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  throw new Error(`XSRF token cookie is missing for ${url}`);
}

async function registerOrganisationViaExternalRequest(
  requestContext: APIRequestContext,
  input: RegisterOrganisationInput
): Promise<RegisterOrganisationResult> {
  const registerPagePath = '/register-org-new/register';
  const registerApiPath = '/external/register-org-new/register';
  const registerPageUrl = new URL(registerPagePath, config.registerUrl).toString();
  const origin = new URL(config.registerUrl).origin;

  const pageResponse = await requestContext.get(registerPagePath, { failOnStatusCode: false });
  if (!pageResponse.ok()) {
    const pageBody = await pageResponse.text().catch(() => 'Unable to read response body');
    throw new Error(`Unable to load register organisation page (${pageResponse.status()}): ${pageBody}`);
  }

  const setCookieHeaders = pageResponse
    .headersArray()
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value);
  const xsrfToken = getXsrfTokenFromSetCookieHeaders(setCookieHeaders, registerPageUrl);
  const payload = buildRegisterOrganisationPayload(input);

  const response = await requestContext.post(registerApiPath, {
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

  const responseBody = await response.text().catch(() => '');
  if (!response.ok()) {
    throw new Error(`Register organisation request failed (${response.status()}): ${responseBody}`);
  }

  return buildRegisterOrganisationResult(payload, responseBody);
}

export async function registerOrganisationViaExternalApi(input: RegisterOrganisationInput): Promise<RegisterOrganisationResult> {
  const requestContext = await playwrightRequest.newContext({
    baseURL: config.registerUrl,
    ignoreHTTPSErrors: true
  });

  try {
    return await registerOrganisationViaExternalRequest(requestContext, input);
  } finally {
    await requestContext.dispose();
  }
}

export async function registerOrganisationViaExternalEndpoint(page: Page, input: RegisterOrganisationInput): Promise<RegisterOrganisationResult> {
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

  const responseBody = await response.text().catch(() => '');
  if (!response.ok()) {
    throw new Error(`Register organisation request failed (${response.status()}): ${responseBody}`);
  }

  return buildRegisterOrganisationResult(payload, responseBody);
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
