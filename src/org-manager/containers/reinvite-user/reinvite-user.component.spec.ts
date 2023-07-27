import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { checkboxesBeCheckedValidator } from '@hmcts/rpx-xui-common-lib';
import * as fromRoot from '../../../app/store';
import { ReinviteUserComponent } from './reinvite-user.component';

describe('ReinviteUserComponent', () => {
  let component: ReinviteUserComponent;
  let userStoreSpyObject;

  beforeEach(() => {
    userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
    const actionSpy = jasmine.createSpyObj('actionSpy', ['pipe']);
    component = new ReinviteUserComponent(userStoreSpyObject, actionSpy);

    component.inviteUserForm = new UntypedFormGroup({
      firstName: new UntypedFormControl('first', Validators.required),
      lastName: new UntypedFormControl('last', Validators.required),
      email: new UntypedFormControl('test@email.com', [Validators.email, Validators.required]),
      roles: new UntypedFormGroup({
        'pui-case-manager': new UntypedFormControl(''),
        'pui-user-manager': new UntypedFormControl(''),
        'pui-organisation-manager': new UntypedFormControl(''),
        'pui-finance-manager': new UntypedFormControl('')
      }, checkboxesBeCheckedValidator())
    });
  });

  it('Is Truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch fromRoot.Back action on goBack', () => {
    const expectedAction = new fromRoot.Back();
    component.onGoBack();
    expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should submit form and showWarningMessage should to falsy ', () => {
    component.onSubmit('test');
    expect(component.showWarningMessage).toBeFalsy();
  });

  it('should submit form and showWarningMessage should to falsy ', () => {
    component.dispatchValidationAction();
    expect(userStoreSpyObject.dispatch).toHaveBeenCalled();
  });
});
