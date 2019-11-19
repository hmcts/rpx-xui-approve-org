import { OrganisationEffects } from './organisation.effects';
// import { SingleOrgEffects } from './single-org.effects';

import { PendingOrgEffects } from './org-pending.effects';
// import { SingleOrgPendingEffects } from './single-org-pending.effects';

export const effects: any[] = [
  OrganisationEffects,
  // SingleOrgEffects,
  PendingOrgEffects,
  // SingleOrgPendingEffects
];

export * from './organisation.effects';
// export * from './single-org.effects';





export * from './org-pending.effects';
// export * from './single-org-pending.effects';

