export interface OrganisationAddress {
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  county: string;
  dxAddress: [OrganisationDxAddress];
  }

export interface OrganisationDxAddress {
      dxNumber: string;
      dxExchange: string;
  }

export interface OrganisationSuperUser {
  userIdentifier: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface  Organisation {
  sraId?: string;
  organisationIdentifier: string;
  contactInformation: [OrganisationAddress];
  superUser: OrganisationSuperUser;
  status: string;
  name: string;
  paymentAccount: [any];
}

export class OrganisationVM {
  organisationId: string;
  status: string;
  admin: string;
  adminEmail: string;
  address: string;
  name: string;
  view: string;
  pbaNumber: [any];
  dxNumber: [any];
  sraId?: string;
}

export interface OrganisationSummary extends OrganisationVM {
  routerLink: string;
}
