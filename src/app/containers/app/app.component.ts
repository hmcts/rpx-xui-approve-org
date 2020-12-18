import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { GoogleAnalyticsService, ManageSessionServices } from '@hmcts/rpx-xui-common-lib';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, take } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/services/environment.service';
import { environment as config } from '../../../environments/environment';
import * as fromRoot from '../../store';
import { RoleService } from '@hmcts/rpx-xui-common-lib';
import { CookieService } from 'ngx-cookie';
import { AppUtils } from 'src/app/utils/app-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public title$: Observable<string>;
  public identityBar$: Observable<string[]>;
  public modalData$: Observable<{isVisible?: boolean; countdown?: string}>;

  constructor(
    private readonly store: Store<fromRoot.State>,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly idleService: ManageSessionServices,
    private readonly environmentService: EnvironmentService,
    private readonly roleService: RoleService,
    private readonly cookieService: CookieService
  ) {}

  public ngOnInit() {
    this.environmentService.getEnv$().subscribe(env => {
      if (env.oidcEnabled) {
        this.store.dispatch(new fromRoot.GetUserDetails());
      }
      const encodedRoles = this.cookieService.getObject('roles');
      if(encodedRoles) {
        this.roleService.roles = AppUtils.getRoles(encodedRoles);
      }
    });

    this.googleAnalyticsService.init(config.googleAnalyticsKey);
    this.modalData$ = this.store.pipe(select(fromRoot.getModalSessionData));
    // this.identityBar$ = this.store.pipe(select(fromSingleFeeAccountStore.getSingleFeeAccountData));
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
        this.store.dispatch(new fromRoot.SignedOut()); // sing out BE
        return;
      }
      case 'keepalive': {
        this.store.dispatch(new fromRoot.KeepAlive());
        return;
      }
      default: {
        throw new Error('Invalid Dispatch session');
      }
    }
  }

  public idleStart() {
    const route$ = this.store.pipe(select(fromRoot.getRouterUrl));
    const userIdleSession$ =  this.store.pipe(select(fromRoot.getUserIdleTime));
    const userTimeOut$ =  this.store.pipe(select(fromRoot.getUserTimeOut));
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
    this.store.dispatch(new fromRoot.SetModal(modalConfig));
  }

  public onStaySignedIn() {
    const payload = {
      session : {
        isVisible: false
      }
    };
    this.store.dispatch(new fromRoot.SetModal(payload));
  }

  public onNavigate(event): void {
    if (event === 'sign-out') {
      return this.store.dispatch(new fromRoot.Logout());
    }
  }
}
