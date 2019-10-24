import { PendingOrgEffects } from './org-pending.effects';
import { OrganisationEffects } from './organisation.effects';
import { SingleOrgPendingEffects } from './single-org-pending.effects';
import { SingleOrgEffects } from './single-org.effects';

export const effects: any[] = [
  OrganisationEffects,
  SingleOrgEffects,
  PendingOrgEffects,
  SingleOrgPendingEffects
];

export * from './org-pending.effects';
export * from './organisation.effects';
export * from './single-org-pending.effects';
export * from './single-org.effects';
