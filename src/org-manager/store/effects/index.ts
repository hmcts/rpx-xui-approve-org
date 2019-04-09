import { OrganisationEffects } from './organisation.effects';
import { SingleFeeAccountEffects } from './single-fee-account.effects';

export const effects: any[] = [
  OrganisationEffects,
  SingleFeeAccountEffects
];

export * from './organisation.effects';
export * from './single-fee-account.effects';
