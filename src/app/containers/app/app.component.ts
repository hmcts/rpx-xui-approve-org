import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from '../../store';
import {combineLatest, Observable} from 'rxjs';
import * as fromActions from '../../store';
import { GoogleAnalyticsService, ManageSessionServices } from '@hmcts/rpx-xui-common-lib';
import { environment as config } from '../../../environments/environment';
import * as fromUser from '../../../user-profile/store';
import {filter, first, take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title$: Observable<string>;
  public modalData$: Observable<{isVisible?: boolean; countdown?: string}>;


  constructor(
    private store: Store<fromRoot.State>,
    private googleAnalyticsService: GoogleAnalyticsService,
    private idleService: ManageSessionServices,
  ) {}

  ngOnInit() {
    this.googleAnalyticsService.init(config.googleAnalyticsKey);
    this.modalData$ = this.store.pipe(select(fromUser.getModalSessionData));
    this.title$ = this.store.pipe(select(fromRoot.getAppPageTitle));
    this.store.pipe(select(fromRoot.getRouterState)).subscribe(rootState => {
      if (rootState) {
        this.store.dispatch(new fromRoot.SetPageTitle(rootState.state.url));
      }
    });

    this.idleStart();
    this.idleService.appStateChanges().subscribe(value => {
      this.dispatchSessionAction(value);
    });
  }

  public dispatchSessionAction(value) {
    switch (value.type) {
      case 'modal': {
        this.dispatchModal(value.countdown, value.isVisible);
        return;
      }
      case 'signout': {
        this.dispatchModal(undefined, false);
        this.store.dispatch(new fromUser.SignedOut()); // sing out BE
        return;
      }
      case 'keepalive': {
        this.store.dispatch(new fromUser.KeepAlive());
        return;
      }
    }
  }

  public idleStart() {
    const route$ = this.store.pipe(select(fromRoot.getRouterUrl));
    const userIdleSession$ =  this.store.pipe(select(fromUser.getUserIdleTime));
    const userTimeOut$ =  this.store.pipe(select(fromUser.getUserTimeOut));
    combineLatest([
      route$.pipe(first(value => typeof value === 'string' )),
      userIdleSession$.pipe(filter(value => !isNaN(value)), take(1)),
      userTimeOut$.pipe(filter(value => !isNaN(value)), take(1))
    ]).subscribe(([routes, idleMilliseconds, timeout]) => {
      const isSignedOut: boolean = routes.indexOf('signed-out') !== -1;
      if (timeout && idleMilliseconds && !isSignedOut) {
        const idleConfig: any = { // todo change this any
          timeout,
          idleMilliseconds,
          keepAliveInSeconds: 5 * 60 * 60, // 5 hrs
          idleServiceName: 'idleSession'
        };
        this.idleService.init(idleConfig);
      }
    });
  }

  public dispatchModal(countdown = '0', isVisible): void {
    const modalConfig: any = {
      session: {
        countdown,
        isVisible
      }
    };
    this.store.dispatch(new fromUser.SetModal(modalConfig));
  }

  public onStaySignedIn() {
    const payload = {
      session : {
        isVisible: false
      }
    };
    this.store.dispatch(new fromUser.SetModal(payload));
  }

  onNavigate(event): void {
    if (event === 'sign-out') {
      return this.store.dispatch(new fromActions.Logout());
    }
  }

}
