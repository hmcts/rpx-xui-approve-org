export interface  PendingOrganisation {
  name:string;
  organisationId: string;
  address: string;
  pbaNumber: string;
  admin: string;
  status: string;
  view: string;
}
export interface PendingOrganisationSummary extends PendingOrganisation {
  routerLink: string;
}


