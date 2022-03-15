import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { EnvironmentService } from 'src/app/services/environment.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {

  let envServiceSpy: EnvironmentService;

  beforeEach(() => {
    envServiceSpy = jasmine.createSpyObj('EnvironmentService', ['get', 'getEnv$']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthService,
        { provide: EnvironmentService, useValue: envServiceSpy }
      ]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should redirect when oidc enabled', inject([AuthService], (service: AuthService) => {
    envServiceSpy.get = jasmine.createSpy('get').and.returnValue(true);
    service.redirect = jasmine.createSpy('redirect').and.returnValue(null);
    service.loginRedirect();
    expect(service.redirect).toHaveBeenCalledTimes(1);
    expect(service.redirect).toHaveBeenCalledWith('/auth/login');
  }));

});
