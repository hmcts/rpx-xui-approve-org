export interface  Organisation {
  organisationId: string;
  pbaNumber: string;
  admin: string;
  status: string;
  view: string;
  userId?:	string
}
export interface OrganisationSummary extends Organisation {
  routerLink: string;
}


