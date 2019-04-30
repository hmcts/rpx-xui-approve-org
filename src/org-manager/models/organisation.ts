export interface  Organisation {
  organisationId: string;
  pbaNumber: string;
  address: string;
  admin: string;
  status: string;
  view: string;
  userId?:	string;
  id: string;
}
export interface OrganisationSummary extends Organisation {
  routerLink: string;
}


