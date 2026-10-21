import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConstants } from '../../app.constants';
import * as fromRoot from '../../store';
import { Helper, Navigation } from './footer.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent {
  public helpData: Helper = AppConstants.FOOTER_DATA;
  public navigationData: Navigation = AppConstants.FOOTER_DATA_NAVIGATION;
  public loggedInUserEmail$: Observable<string>;
  public showLoggedInUser: boolean;

  constructor(private readonly store: Store<fromRoot.State>) {
    this.loggedInUserEmail$ = this.store.pipe(
      select(fromRoot.getUser),
      map((user) => user?.emailId)
    );
    this.showLoggedInUser = this.isLowerEnvironment(window.location.hostname);
  }

  public isLowerEnvironment(hostname: string): boolean {
    const production = AppConstants.ENVIRONMENT_NAMES.prod;
    return Object.entries(AppConstants.ENVIRONMENT_NAMES)
      .filter(([, environment]) => environment !== production)
      .some(([, environment]) => hostname.toLowerCase().includes(environment));
  }
}
