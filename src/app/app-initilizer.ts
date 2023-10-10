import { Store } from '@ngrx/store';
import { EnvironmentService } from './services/environment.service';
import * as fromApp from './store';

export function initApplication(store: Store<fromApp.State>, environmentService: EnvironmentService): VoidFunction {
  return () => new Promise((resolve) => {
    environmentService.getEnv$().subscribe(() => {
      resolve(true);
    });
  });
}
