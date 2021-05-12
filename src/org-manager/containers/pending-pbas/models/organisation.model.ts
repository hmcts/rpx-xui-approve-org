import { PBANumberModel } from './pbaNumber.model';

export interface OrganisationModel {
  organisationIdentifier: string;
  status: string;
  pbaNumbers?: PBANumberModel[];
}

export interface RenderableOrganisation {
  organisationId: string;
  admin: string;
  adminEmail: string;
  name: string;
  pbaNumbers: PBANumberModel[];
  receivedDate: string;
}