import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { AppConstants } from './app.constants';
import { EnvironmentService } from './services/environment.service';
import * as fromApp from './store';
import * as fromSelectors from './store/selectors/app.selectors';

export function initApplication(store: Store<fromApp.State>, environmentService: EnvironmentService): VoidFunction {
  return () => new Promise((resolve) => {
    /* store.dispatch(new fromApp.StartAppInitilizer());
    store.dispatch(new fromApp.LoadFeatureToggleConfig([
      AppConstants.FEATURE_NAMES.newRegisterOrg]));
    store.pipe(
      select(fromSelectors.getAppState),
      take(2)
    ).subscribe((appState) => {
      if (appState.featureFlags) {
        store.dispatch(new fromApp.FinishAppInitilizer());
        resolve(true);
      }
    }); */
    environmentService.getEnv$().subscribe(() => {
      resolve(true);
    });
  });
}
