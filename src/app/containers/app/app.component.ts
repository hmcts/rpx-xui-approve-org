import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../store';
import { Observable } from 'rxjs';
import * as fromActions from '../../store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title$: Observable<string>;
  identityBar$: Observable<string[]>;


  constructor(
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    // this.identityBar$ = this.store.pipe(select(fromSingleFeeAccountStore.getSingleFeeAccountData));
    this.title$ = this.store.pipe(select(fromRoot.getAppPageTitle));
    this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
      if (rootState) {
        rootState.state ? this.store.dispatch(new fromRoot.SetPageTitle(rootState.state.url)) :
                          this.store.dispatch(new fromRoot.SetPageTitle(''));
      }
    });
  }

  onNavigate(event): void {
    if (event === 'sign-out') {
      return this.store.dispatch(new fromActions.Logout());
    }
  }

}
