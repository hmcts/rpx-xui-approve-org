export interface  PendingOrganisation {
  organisationId: string;
  pbaNumber: string;
  address: string;
  admin: string;
  status: string;
  view: string;
  userId?:	string;
  test: string;
}
export interface PendingOrganisationSummary extends PendingOrganisation {
  routerLink: string;
}


