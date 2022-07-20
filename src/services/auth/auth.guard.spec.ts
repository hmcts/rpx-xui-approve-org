import { inject, TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { CookieService } from 'ngx-cookie';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthGuard } from './auth.guard';

const config = {
  config: {
    cookies: {
      token: 'bob',
      userId: 'ben'
    },
    services: {
      idam_web: 'http://idam_url.com'
    },
    oauth_callback_url: 'callback_url',
    api_base_url: 'api_base',
    idam_client: 'client_name'
  }
};

const router = {
  navigate: () => { }
};

const cookieService = {
  get: key => {
    return cookieService[key];
  },
  set: (key, value) => {
    cookieService[key] = value;
  },
  removeAll: () => { }
};


class HttpClientMock {
  public get() {
    return of('response');
  }
}

class MockAuthService {
  public authenticated = false;

  public isAuthenticated() {
    return of(this.authenticated);
  }

  public loginRedirect() {}
}

describe('AuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    service = new MockAuthService();

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({})
      ],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: environment, useValue: config },
        { provide: Router, useValue: router },
        { provide: CookieService, useValue: cookieService },
        { provide: HttpClient, useClass: HttpClientMock }
      ]
    });
  });

  it('should exist', inject([AuthGuard], (gurad: AuthGuard) => {
    expect(gurad).toBeTruthy();
  }));


  it('should exist', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard.canActivate).toBeDefined();
  }));

  describe('canActivate()', () => {
    it('should return true when authenticated', inject([AuthGuard], (guard: AuthGuard) => {
      service.authenticated = true;

      guard.canActivate().subscribe(result => expect(result).toBeTruthy());
    }));

    it('should return false when unauthenticated', inject([AuthGuard], (guard: AuthGuard) => {
      service.authenticated = false;

      guard.canActivate().subscribe(result => expect(result).toBeFalsy());
    }));
  });
});
