import { User } from '@hmcts/rpx-xui-common-lib';

export interface OrganisationAddress {
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  county: string;
  dxAddress: OrganisationDxAddress[];
  postCode?: string;
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

export interface OrganisationUser {
  userIdentifier: string;
  firstName: string;
  lastName: string;
  email: string;
  idamStatus: string;
  idamStatusCode: string;
  idamMessage: string;
  roles: string[];
}

export interface OrganisationUserListModel {
  users: User[];
  isError: boolean;
}

export interface  Organisation {
  sraId?: string;
  organisationIdentifier: string;
  contactInformation: OrganisationAddress[];
  superUser: OrganisationSuperUser;
  status: string;
  name: string;
  paymentAccount: any[];
}

export class OrganisationVM {
  organisationId: string;
  status: string;
  admin: string;
  adminEmail: string;
  addressLine1: string;
  addressLine2: string;
  postCode?: string;
  townCity: string;
  county: string;
  name: string;
  view: string;
  pbaNumber: any[];
  dxNumber: any[];
  sraId?: string;
  isAccLoaded?: boolean;
  accountDetails?: object
}

export interface OrganisationSummary extends OrganisationVM {
  routerLink: string;
}
