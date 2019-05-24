import { PendingOrgEffects } from './org-pending.effects';
import { SingleOrgEffects } from './single-org-pending.effects';

export const effects: any[] = [
  PendingOrgEffects,
  SingleOrgEffects
];

export * from './org-pending.effects';
export * from './single-org-pending.effects';
