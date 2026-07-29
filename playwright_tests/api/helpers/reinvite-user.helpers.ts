import { randomBytes } from 'node:crypto';

export function createMissingReinviteEmail(): string {
  return `missing-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}@example.com`;
}
