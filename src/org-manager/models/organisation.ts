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
  public organisationId: string;
  public status: string;
  public admin: string;
  public adminEmail: string;
  public addressLine1: string;
  public addressLine2: string;
  public townCity: string;
  public county: string;
  public name: string;
  public view: string;
  public pbaNumber: [any];
  public dxNumber: [any];
  public sraId?: string;
}

export interface OrganisationSummary extends OrganisationVM {
  routerLink: string;
}
