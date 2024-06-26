import { Component, Inject, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { Title } from '@angular/platform-browser';
import { Event, Router, RoutesRecognized } from '@angular/router';
import { FeatureToggleService, GoogleAnalyticsService, ManageSessionServices } from '@hmcts/rpx-xui-common-lib';
import { RoleService } from '@hmcts/rpx-xui-common-lib';
import { CookieService } from 'ngx-cookie';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, take } from 'rxjs/operators';
import { environment as config } from '../../../environments/environment';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from '../../../models/environmentConfig.model';
import { EnvironmentService } from '../../services/environment.service';
import * as fromRoot from '../../store';
import { AppUtils } from '../../utils/app-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public identityBar$: Observable<string[]>;
  public modalData$: Observable<{ isVisible?: boolean; countdown?: string }>;
  public mainContentId = 'content';

  constructor(
    private readonly store: Store<fromRoot.State>,
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly idleService: ManageSessionServices,
    @Inject(ENVIRONMENT_CONFIG) private readonly environmentConfig: EnvironmentConfig,
    private readonly environmentService: EnvironmentService,
    private readonly featureService: FeatureToggleService,
    private readonly roleService: RoleService,
    private readonly cookieService: CookieService,
    private readonly router: Router,
    private readonly titleService: Title
  ) {
    this.router.events.subscribe((data) => {
      this.setTitleIfPresent(data);
    });
  }

  public ngOnInit() {
    this.environmentService.getEnv$().subscribe((env) => {
      if (env.oidcEnabled) {
        this.store.dispatch(new fromRoot.GetUserDetails());
      }
      const encodedRoles = this.cookieService.get('roles');
      if (encodedRoles) {
        this.roleService.roles = AppUtils.getRoles(encodedRoles);
      }
    });

    this.featureService.initialize({ anonymous: true }, this.environmentConfig.launchDarklyClientId);

    this.googleAnalyticsService.init(config.googleAnalyticsKey);
    this.modalData$ = this.store.pipe(select(fromRoot.getModalSessionData));
    // this.identityBar$ = this.store.pipe(select(fromSingleFeeAccountStore.getSingleFeeAccountData));

    this.idleStart();
    this.idleService.appStateChanges().subscribe((value) => {
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
    const userIdleSession$ = this.store.pipe(select(fromRoot.getUserIdleTime));
    const userTimeOut$ = this.store.pipe(select(fromRoot.getUserTimeOut));
    combineLatest([
      route$.pipe(first((value) => typeof value === 'string')),
      userIdleSession$.pipe(filter((value) => !isNaN(value)), take(1)),
      userTimeOut$.pipe(filter((value) => !isNaN(value)), take(1))
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
      session: {
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

  public setTitleIfPresent(data: Event) {
    if (data instanceof RoutesRecognized) {
      let child = data.state.root;
      while (child.firstChild) {
        child = child.firstChild;
      }
      const d = child.data;
      if (d.title) {
        this.titleService.setTitle(`${d.title} - HM Courts & Tribunals Service - GOV.UK`);
      }
    }
  }

  // the fragment attribute in Angular is good however it only scrolls to the anchor tag
  // focussing is not currently supported by the Angular RouterModule and fragment hence this workaround
  public onFocusMainContent() {
    const element = document.getElementById(this.mainContentId);
    if (element) {
      element.focus();
    }
  }
}
