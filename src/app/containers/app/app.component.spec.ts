import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { RoutesRecognized } from '@angular/router';
import {
  FeatureToggleService,
  GoogleAnalyticsService,
  ManageSessionServices,
  RoleService
} from '@hmcts/rpx-xui-common-lib';
import { CookieService } from 'ngx-cookie';
import { of, Subject } from 'rxjs';
import { EnvironmentConfig } from '../../../models/environmentConfig.model';
import { EnvironmentService } from '../../services/environment.service';
import * as fromRoot from '../../store';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let store: jasmine.SpyObj<any>;
  let googleAnalyticsService: jasmine.SpyObj<GoogleAnalyticsService>;
  let idleService: jasmine.SpyObj<ManageSessionServices>;
  let environmentService: jasmine.SpyObj<EnvironmentService>;
  let featureService: jasmine.SpyObj<FeatureToggleService>;
  let roleService: RoleService;
  let cookieService: jasmine.SpyObj<CookieService>;
  let routerEvents$: Subject<any>;
  let titleService: jasmine.SpyObj<Title>;

  const environmentConfig = {
    launchDarklyClientId: 'launch-darkly-client-id'
  } as EnvironmentConfig;

  function createRoutesRecognized(title?: string): RoutesRecognized {
    return new RoutesRecognized(1, '/test', '/test', {
      root: {
        firstChild: {
          firstChild: null,
          data: title ? { title } : {}
        }
      }
    } as any);
  }

  function createComponent(): void {
    store = jasmine.createSpyObj('store', ['dispatch', 'pipe']);
    store.pipe.and.returnValue(of(null));
    googleAnalyticsService = jasmine.createSpyObj('googleAnalyticsService', ['init']);
    idleService = jasmine.createSpyObj('idleService', ['appStateChanges', 'init']);
    idleService.appStateChanges.and.returnValue(of({ type: 'modal', countdown: '10', isVisible: true }));
    environmentService = jasmine.createSpyObj('environmentService', ['getEnv$']);
    environmentService.getEnv$.and.returnValue(of({ oidcEnabled: false } as EnvironmentConfig));
    featureService = jasmine.createSpyObj('featureService', ['initialize']);
    roleService = { roles: [] } as RoleService;
    cookieService = jasmine.createSpyObj('cookieService', ['get']);
    cookieService.get.and.returnValue(undefined);
    routerEvents$ = new Subject<any>();
    titleService = jasmine.createSpyObj('titleService', ['setTitle']);

    component = new AppComponent(
      store,
      googleAnalyticsService,
      idleService,
      environmentConfig,
      environmentService,
      featureService,
      roleService,
      cookieService,
      { events: routerEvents$.asObservable() } as any,
      titleService
    );
  }

  beforeEach(() => {
    createComponent();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialise analytics, feature flags, modal data and session management', () => {
      const modalSession = { isVisible: false, countdown: '0' };
      store.pipe.and.returnValues(
        of(modalSession),
        of('/organisation'),
        of(300000),
        of(60)
      );
      environmentService.getEnv$.and.returnValue(of({ oidcEnabled: true } as EnvironmentConfig));
      cookieService.get.and.returnValue('j%3A%5B%22prd-admin%22%2C%22xui-approver-userdata%22%5D');

      component.ngOnInit();

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.GetUserDetails());
      expect(roleService.roles).toEqual(['prd-admin', 'xui-approver-userdata']);
      expect(featureService.initialize).toHaveBeenCalledWith({ anonymous: true }, 'launch-darkly-client-id');
      expect(googleAnalyticsService.init).toHaveBeenCalled();
      expect(component.modalData$).toBeTruthy();
      expect(idleService.init).toHaveBeenCalledWith({
        timeout: 60,
        idleMilliseconds: 300000,
        keepAliveInSeconds: 5 * 60 * 60,
        idleServiceName: 'idleSession'
      });
      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SetModal({
        session: {
          countdown: '10',
          isVisible: true
        }
      }));
    });

    it('should skip user details and role setup when oidc and roles are not available', () => {
      store.pipe.and.returnValues(of({}), of('/organisation'), of(300000), of(60));
      environmentService.getEnv$.and.returnValue(of({ oidcEnabled: false } as EnvironmentConfig));

      component.ngOnInit();

      expect(store.dispatch).not.toHaveBeenCalledWith(new fromRoot.GetUserDetails());
      expect(roleService.roles).toEqual([]);
    });
  });

  describe('dispatchSessionAction', () => {
    it('should dispatch a modal action', () => {
      component.dispatchSessionAction({ type: 'modal', countdown: '5', isVisible: true });

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SetModal({
        session: {
          countdown: '5',
          isVisible: true
        }
      }));
    });

    it('should hide the modal and dispatch sign out', () => {
      component.dispatchSessionAction({ type: 'signout' });

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SetModal({
        session: {
          countdown: '0',
          isVisible: false
        }
      }));
      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SignedOut());
    });

    it('should dispatch keep alive', () => {
      component.dispatchSessionAction({ type: 'keepalive' });

      expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.KeepAlive());
    });

    it('should throw for an unknown session action', () => {
      expect(() => component.dispatchSessionAction({ type: 'unexpected' })).toThrowError('Invalid Dispatch session');
    });
  });

  describe('idleStart', () => {
    it('should initialise idle service when route and user timeout values are ready', () => {
      store.pipe.and.returnValues(of('/organisation'), of(120000), of(30));

      component.idleStart();

      expect(idleService.init).toHaveBeenCalledWith({
        timeout: 30,
        idleMilliseconds: 120000,
        keepAliveInSeconds: 5 * 60 * 60,
        idleServiceName: 'idleSession'
      });
    });

    it('should not initialise idle service on the signed out route', () => {
      store.pipe.and.returnValues(of('/signed-out'), of(120000), of(30));

      component.idleStart();

      expect(idleService.init).not.toHaveBeenCalled();
    });

    it('should not initialise idle service when timeout values are missing', () => {
      store.pipe.and.returnValues(of('/organisation'), of(120000), of(0));

      component.idleStart();

      expect(idleService.init).not.toHaveBeenCalled();
    });
  });

  it('should dispatch modal', () => {
    component.dispatchModal(undefined, true);

    expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SetModal({
      session: {
        countdown: '0',
        isVisible: true
      }
    }));
  });

  it('should dispatch modal when staying signed in', () => {
    component.onStaySignedIn();

    expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.SetModal({
      session: {
        isVisible: false
      }
    }));
  });

  it('should dispatch a logout action', () => {
    component.onNavigate('sign-out');

    expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.Logout());
  });

  it('should ignore other navigation events', () => {
    component.onNavigate('continue');

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should call the title service with route title', () => {
    component.setTitleIfPresent(createRoutesRecognized('Test'));

    expect(titleService.setTitle).toHaveBeenCalledWith('Test - HM Courts & Tribunals Service - GOV.UK');
  });

  it('should not call the title service when route title is missing', () => {
    component.setTitleIfPresent(createRoutesRecognized());

    expect(titleService.setTitle).not.toHaveBeenCalled();
  });

  it('should set title when router emits a recognised route', () => {
    routerEvents$.next(createRoutesRecognized('Cookies'));

    expect(titleService.setTitle).toHaveBeenCalledWith('Cookies - HM Courts & Tribunals Service - GOV.UK');
  });

  it('should ignore router events that are not recognised routes', () => {
    component.setTitleIfPresent(new HttpErrorResponse({}) as any);

    expect(titleService.setTitle).not.toHaveBeenCalled();
  });

  it('should focus the main content element', () => {
    const main = document.createElement('main');
    main.id = component.mainContentId;
    const focusSpy = spyOn(main, 'focus');
    document.body.appendChild(main);

    component.onFocusMainContent();

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(main);
  });

  it('should not error when the main content element is missing', () => {
    expect(() => component.onFocusMainContent()).not.toThrow();
  });
});
