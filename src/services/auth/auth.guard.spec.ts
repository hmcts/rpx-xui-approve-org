import { HttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

class HttpClientMock {
  get() {
      return of('response');
  }
}

describe('AuthGuard', () => {
  let authService: AuthService;
  let authGuard: AuthGuard;
  let loginRedirectSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AuthGuard,
        { provide: HttpClient, useClass: HttpClientMock }
      ]
    });

    authService = TestBed.inject(AuthService);
    authGuard = TestBed.inject(AuthGuard);
    loginRedirectSpy = spyOn(authService, 'loginRedirect').and.returnValue();
  });

  it('should exist', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should redirect to login when unauthenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(of(false));

    authGuard.canActivate().subscribe(canActivate => {
      expect(loginRedirectSpy).toHaveBeenCalled();
      expect(canActivate).toBeFalse();
    });
  });

  it('should return true when authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(of(true));

    authGuard.canActivate().subscribe(canActivate => {
      expect(loginRedirectSpy).not.toHaveBeenCalled();
      expect(canActivate).toBeTrue();
    });
  });
});
