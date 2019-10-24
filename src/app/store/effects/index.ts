import { AppEffects } from './app.effects';
import { RouterEffects } from './router.effect';

export const effects: any[] = [RouterEffects, AppEffects];

export * from './app.effects';
export * from './router.effect';

