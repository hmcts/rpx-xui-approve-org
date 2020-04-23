import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { CookieModule, CookieService} from 'ngx-cookie';
import { environment } from 'src/environments/environment';
import { UserApprovalGuard } from './users-approval.guard';

const config = {
  cookies: {
    roles: 'xui-approver-userdata'
  }
};

describe('UserApprovalGuard', () => {

  let cookieService: CookieService;
  let userApprovalGuard: UserApprovalGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        CookieModule.forRoot(),
      ],
      providers: [
        { provide: environment, useValue: config }
      ]
    });

    cookieService = TestBed.get(CookieService);
    userApprovalGuard = TestBed.get(UserApprovalGuard);
  });

  it('isUserApprovalRole should be true when it has xui-approver-userdata role', () => {
    spyOn(cookieService, 'get').and.returnValue('xui-approver-userdata');
    expect(userApprovalGuard.isUserApprovalRole()).toBeTruthy();
  });

  it('isUserApprovalRole should be false when it doesnt have xui-approver-userdata role', () => {
    spyOn(cookieService, 'get').and.returnValue('any-role');
    expect(userApprovalGuard.isUserApprovalRole()).toBeFalsy();
  });

  it('canActivate should be false when it doesnt have xui-approver-userdata role', () => {
    spyOn(cookieService, 'get').and.returnValue('any-role');
    spyOn(userApprovalGuard, 'redirectToPendingOrgs').and.callThrough();
    expect(userApprovalGuard.canActivate()).toBeFalsy();
    expect(userApprovalGuard.redirectToPendingOrgs).toHaveBeenCalled();
  });

});
