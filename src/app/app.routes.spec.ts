import { CommonModule, DatePipe, Location } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, ManageSessionServices, RoleGuard, windowToken } from '@hmcts/rpx-xui-common-lib';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { SharedModule } from 'src/shared/shared.module';
import { ROUTES } from './app.routes';
import { CryptoWrapper } from './services/cryptoWrapper';
import { EnvironmentService } from './services/environment.service';
import { JwtDecodeWrapper } from './services/jwtDecodeWrapper';
import { LoggerService } from './services/logger.service';
import { MonitoringService } from './services/monitoring.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  selector: 'app-mock-root',
  template: '<router-outlet></router-outlet>',
  standalone: false
})
class AppMockComponent {}

class AuthServiceMock {
  public authenticated: boolean = true;

  public isAuthenticated(): Observable<boolean> {
    return of(this.authenticated);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public loginRedirect(): void {}
}

class RoleGuardMock {
  public activate: boolean = false;

  public canActivate(): Observable<boolean> {
    return of(this.activate);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public loginRedirect(): void {}
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const windowMock: Window = { gtag: () => {} } as any;
const idleMockService = jasmine.createSpyObj('idleService', ['appStateChanges']);
const environmentMockService = jasmine.createSpyObj('environmentService', ['getEnv$']);
const cookieService = jasmine.createSpyObj('cookieSevice', ['get']);
const titleService = jasmine.createSpyObj('titleService', ['setTitle', 'getTitle']);

describe('AppRoutes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let component: AppMockComponent;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let location: Location;
  let router: Router;
  let fixture;

  const authServiceMock = new AuthServiceMock();
  const roleGuardMock = new RoleGuardMock();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppMockComponent
      ],
      imports: [CommonModule,
        StoreModule.forRoot({}),
        RouterTestingModule.withRoutes(ROUTES),
        EffectsModule.forRoot([]),
        ExuiCommonLibModule,
        SharedModule,
        LoggerTestingModule],
      providers: [
        Location,
        LoggerService,
        MonitoringService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: RoleGuard, useValue: roleGuardMock },
        {
          provide: windowToken,
          useValue: windowMock
        },
        { provide: ManageSessionServices, useValue: idleMockService },
        { provide: EnvironmentService, useValue: environmentMockService },
        { provide: CookieService, useValue: cookieService },
        { provide: Title, useValue: titleService },
        DatePipe,
        CryptoWrapper,
        JwtDecodeWrapper,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(AppMockComponent);
    component = fixture.componentInstance;
    router.initialNavigation();
    fixture.detectChanges();
  }));

  beforeEach(() => {
    router = TestBed.inject(Router);
    router.initialNavigation();
  });

  it('should navigate to cookie path', async () => {
    await router.navigateByUrl('cookies');
    fixture.detectChanges();

    expect(router.url).toEqual('/cookies');
  });

  describe('caseworker-details', () => {
    it('should navigate to root when correct auth (but not role) present', async () => {
      authServiceMock.authenticated = true;
      roleGuardMock.activate = false;
      await router.navigateByUrl('caseworker-details');
      fixture.detectChanges();

      expect(router.url).toEqual('/');
    });

    it('should navigate to root when unauthenticated', async () => {
      authServiceMock.authenticated = false;
      roleGuardMock.activate = false;
      await router.navigateByUrl('caseworker-details');
      fixture.detectChanges();

      expect(router.url).toEqual('/');
    });

    it('should navigate caseworker-details when auth/role present', async () => {
      authServiceMock.authenticated = true;
      roleGuardMock.activate = true;

      await router.navigateByUrl('caseworker-details');
      fixture.detectChanges();

      expect(router.url).toEqual('/caseworker-details');
    });
  });

  describe('organisation', () => {
    it('should navigate to root when correct auth (but not role) present', async () => {
      authServiceMock.authenticated = true;
      roleGuardMock.activate = false;
      await router.navigateByUrl('organisation');
      fixture.detectChanges();

      expect(router.url).toEqual('/');
    });

    it('should navigate to root when unauthenticated', async () => {
      authServiceMock.authenticated = false;
      roleGuardMock.activate = false;
      await router.navigateByUrl('organisation');
      fixture.detectChanges();

      expect(router.url).toEqual('/');
    });

    it('should navigate organisation when auth/role present', async () => {
      authServiceMock.authenticated = true;
      roleGuardMock.activate = true;

      await router.navigateByUrl('organisation');
      fixture.detectChanges();

      expect(router.url).toEqual('/organisation');
    });
  });
});
