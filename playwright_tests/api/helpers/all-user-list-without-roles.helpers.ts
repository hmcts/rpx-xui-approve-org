export type OrganisationUser = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  idamStatus?: unknown;
};

export type OrganisationListItem = {
  organisationIdentifier?: unknown;
  organisationId?: unknown;
  organisationName?: unknown;
  name?: unknown;
  status?: unknown;
  superUser?: unknown;
  users?: unknown;
  [key: string]: unknown;
};

type OrganisationListPayload = {
  organisations?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOrganisationUser(user: unknown): user is OrganisationUser {
  return isObject(user);
}

export function findUserByEmail(users: unknown[], email: string): OrganisationUser | undefined {
  const normalisedEmail = email.toLowerCase();
  return users.find((user): user is OrganisationUser =>
    isOrganisationUser(user) &&
    typeof user.email === 'string' &&
    user.email.toLowerCase() === normalisedEmail
  );
}

export function extractOrganisations(payload: unknown): OrganisationListItem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isObject) as OrganisationListItem[];
  }

  if (!isObject(payload)) {
    return [];
  }

  const organisations = (payload as OrganisationListPayload).organisations;
  return Array.isArray(organisations) ? organisations.filter(isObject) as OrganisationListItem[] : [];
}

export function getOrganisationUserDetails(organisation: OrganisationListItem): OrganisationUser | undefined {
  if (Array.isArray(organisation.users)) {
    return organisation.users.find(isOrganisationUser);
  }

  return isOrganisationUser(organisation.superUser) ? organisation.superUser : undefined;
}
