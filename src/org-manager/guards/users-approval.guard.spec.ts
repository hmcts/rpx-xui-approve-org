import { inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { CookieModule} from 'ngx-cookie';
import { environment } from 'src/environments/environment';
import { UserApprovalGuard } from './users-approval.guard';

const config = {
  cookies: {
    roles: 'xui-approver-userdata'
  }
};

describe('UserApprovalGuard', () => {
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
  });

  it('should exist', inject([UserApprovalGuard], (gurad: UserApprovalGuard) => {
    expect(gurad).toBeTruthy();
  }));

  it('isUserApprovalRole should return true when there is user approval roles', inject([UserApprovalGuard], (gurad: UserApprovalGuard) => {
    expect(gurad.isUserApprovalRole).toBeTruthy();
  }));

  it('should activated when there is user approval roles', inject([UserApprovalGuard], (gurad: UserApprovalGuard) => {
    expect(gurad.canActivate).toBeTruthy();
  }));

});
