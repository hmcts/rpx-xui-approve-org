import { User, checkboxesBeCheckedValidator } from '@hmcts/rpx-xui-common-lib';
import * as fromRoot from '../../../app/store';
import { ReinviteUserComponent } from './reinvite-user.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as fromStore from '../../store';
import { AppConstants } from 'src/app/app.constants';

describe('ReinviteUserComponent', () => {

    let component: ReinviteUserComponent;
    let userStoreSpyObject;

    beforeEach(() => {
        userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
        const actionSpy = jasmine.createSpyObj('actionSpy', ['pipe']);
        component = new ReinviteUserComponent(userStoreSpyObject, actionSpy);

        component.inviteUserForm = new FormGroup({
          firstName: new FormControl('first', Validators.required),
          lastName: new FormControl('last', Validators.required),
          email: new FormControl('test@email.com', [Validators.email, Validators.required]),
          roles: new FormGroup({
            'pui-case-manager': new FormControl(''),
            'pui-user-manager': new FormControl(''),
            'pui-organisation-manager': new FormControl(''),
            'pui-finance-manager': new FormControl('')
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
});
