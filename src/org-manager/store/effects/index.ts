import { EditDetailsEffects } from './edit-details.effects';
import { OrganisationEffects } from './organisation.effects';
import { UsersEffects } from './users.effects';

export const effects: any[] = [
  EditDetailsEffects,
  OrganisationEffects,
  UsersEffects
];

export * from './edit-details.effects';
export * from './organisation.effects';
export * from './users.effects';

