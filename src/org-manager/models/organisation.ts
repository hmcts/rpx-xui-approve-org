export interface OrganisationAddress {
  addressLine1: string
  townCity: string
  county: string
  dxAddress: [OrganisationDxAddress]
  }

export interface OrganisationDxAddress {
      dxNumber: string,
      dxExchange: string
  }

export interface OrganisationSuperUser {
  userIdentifier: string
  firstName: string,
  lastName: string,
  email: string
}

export interface  Organisation {
  organisationIdentifier: string
  contactInformation: [OrganisationAddress]
  superUser: OrganisationSuperUser
  status: string
  name: string
}

export interface OrganisationSummary extends Organisation {
  routerLink: string;
}

export class organisationVM {
  organisationId: string;
  status: string;
  admin: string;
  address: string;
}