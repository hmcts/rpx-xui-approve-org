import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromActions from '../../store';
import fromRoot = fromActions;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public title$: Observable<string>;

  constructor(
    private readonly _store: Store<fromRoot.State>
  ) {}

  public ngOnInit() {
    this.title$ = this._store.pipe(select(fromRoot.getAppPageTitle));
    this._store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
      if (rootState) {
        this._store.dispatch(new fromRoot.SetPageTitle(rootState.state.url));
      }
    });
  }

  public onNavigate(event: string): void {
    if (event === 'sign-out') {
      return this._store.dispatch(new fromActions.Logout());
    }
  }

}
