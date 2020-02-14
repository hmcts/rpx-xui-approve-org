import { OrganisationService } from './organisation.service';
import { PendingOrganisationService } from './pending-organisation.service';
import {UpdatePbaServices} from './update-pba.services';

export const services: any[] = [OrganisationService, PendingOrganisationService, UpdatePbaServices];

export * from './organisation.service';
export * from './pending-organisation.service';
export * from './update-pba.services';
