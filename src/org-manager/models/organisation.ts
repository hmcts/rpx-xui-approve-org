import { User } from '@hmcts/rpx-xui-common-lib';
import { PBANumberModel } from '../containers/pending-pbas/models/pbaNumber.model';

export interface OrganisationAddress {
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  county: string;
  dxAddress: OrganisationDxAddress[];
  postCode?: string;
}

export interface OrganisationContactInformation {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  townCity: string;
  county: string;
  country: string;
  postCode: string;
  dxAddress: DxAddress[];
}

export interface OrganisationDetails {
  name: string;
  organisationIdentifier: string;
  contactInformation: OrganisationContactInformation[];
  status: string;
  sraId: string;
  sraRegulated: boolean;
  superUser: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentAccount: PBANumberModel[];
  pendingAddPaymentAccount: PBANumberModel[];
  pendingRemovePaymentAccount: PBANumberModel[];
  response?: any;
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

export interface DxAddress {
  dxNumber: string;
  dxExchange: string;
}

export interface Organisation {
  sraId?: string;
  organisationIdentifier: string;
  contactInformation: OrganisationAddress[];
  superUser: OrganisationSuperUser;
  status: string;
  name: string;
  paymentAccount: any[];
  pendingPaymentAccount: any[];
  dateReceived?: string;
  dateApproved?: string;
  organisationType?: string;
  companyRegistrationNumber?: string;
  regulators?: Regulator[];
  individualRegulators?: Regulator[];
}

export class OrganisationVM {
  public organisationId: string;
  public status: string;
  public admin: string;
  public firstName?: string;
  public lastName?: string;
  public adminEmail: string;
  public addressLine1: string;
  public addressLine2: string;
  public postCode?: string;
  public townCity: string;
  public county: string;
  public name: string;
  public view: string;
  public pendingPaymentAccount?: any[];
  public pbaNumber: any[];
  public dxNumber: any[];
  public sraId?: string;
  public isAccLoaded?: boolean;
  public accountDetails?: object;
  public dateReceived?: string;
  public dateApproved?: string;
  public serviceToAccess?: string;
  public organisationType?: string;
  public companyRegistrationNumber?: string;
  public regulators?: Regulator[];
  public individualRegulators?: Regulator[];
}

export interface OrganisationSummary extends OrganisationVM {
  routerLink: string;
}

export interface Regulator {
  regulatorType: string;
  regulatorName?: string;
  organisationRegistrationNumber?: string;
}
