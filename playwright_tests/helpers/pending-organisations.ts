export type PendingOrganisation = {
  name?: string;
  organisationIdentifier?: string;
  status?: string;
};

export const findPendingOrganisation = (
  organisations: PendingOrganisation[],
  expectedOrganisationName: string
) => organisations.find((organisation) => organisation?.name === expectedOrganisationName);

export const findPendingOrganisationId = (
  organisations: PendingOrganisation[],
  expectedOrganisationName: string
) => findPendingOrganisation(organisations, expectedOrganisationName)?.organisationIdentifier;
