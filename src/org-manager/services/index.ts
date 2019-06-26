import { OrganisationService } from './organisation.service';
import { PendingOrganisationService } from './pending-organisation.service';

export const services: any[] = [OrganisationService,PendingOrganisationService];

export * from './organisation.service';
export * from './pending-organisation.service';
