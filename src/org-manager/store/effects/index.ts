import {EditDetailsEffects} from './edit-details.effects';
import {OrganisationEffects} from './organisation.effects';
import { UsersEffects } from './users.effects';

export const effects: any[] = [
  OrganisationEffects,
  EditDetailsEffects,
  UsersEffects
];

export * from './organisation.effects';
export * from './edit-details.effects';
export * from './users.effects';

