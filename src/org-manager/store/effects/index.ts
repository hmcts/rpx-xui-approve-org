import { OrganisationEffects } from './organisation.effects';
import { SingleFeeAccountEffects } from './single-org.effects';

export const effects: any[] = [
  OrganisationEffects,
  SingleFeeAccountEffects
];

export * from './organisation.effects';
export * from './single-org.effects';
