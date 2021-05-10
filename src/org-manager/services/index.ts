import { OrganisationService } from './organisation.service';
import { PbaAccountDetails } from './pba-account-details.services';
import { PbaService } from './pba.service';
import { PendingOrganisationService } from './pending-organisation.service';
import { UpdatePbaServices } from './update-pba.services';
import { UsersService } from './users.service';

export const services: any[] = [
  OrganisationService, PbaAccountDetails, PbaService, PendingOrganisationService, UpdatePbaServices, UsersService
];

export * from './organisation.service';
export * from './pba-account-details.services';
export * from './pba.service';
export * from './pending-organisation.service';
export * from './update-pba.services';
export * from './users.service';
