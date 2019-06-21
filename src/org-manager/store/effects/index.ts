import { OrganisationEffects } from './organisation.effects';
import { SingleOrgEffects } from './single-org.effects';

export const effects: any[] = [
  OrganisationEffects,
  SingleOrgEffects
];

export * from './organisation.effects';
export * from './single-org.effects';
