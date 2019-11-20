import { OrganisationEffects } from './organisation.effects';
import { PendingOrgEffects } from './organisation-pending.effects';

export const effects: any[] = [
  OrganisationEffects,
  PendingOrgEffects,
];

export * from './organisation.effects';
export * from './organisation-pending.effects';


