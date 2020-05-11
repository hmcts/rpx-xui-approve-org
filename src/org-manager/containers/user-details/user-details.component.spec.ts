import { User } from '@hmcts/rpx-xui-common-lib';
import * as fromRoot from '../../../app/store';
import * as fromStore from '../../store';
import {UserDetailsComponent} from './user-details.component';
import { AppConstants } from 'src/app/app.constants';

describe('User Details Component', () => {

    let component: UserDetailsComponent;
    let userStoreSpyObject;

    beforeEach(() => {
        userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
        const actionSpy = jasmine.createSpyObj('actionSpy', ['pipe']);
        component = new UserDetailsComponent(userStoreSpyObject, actionSpy);
    });

    it('Is Truthy', () => {
        expect(component).toBeTruthy();
    });

    it('Should return a correct title based on condition', () => {
      component.isSuperUser = true;
      expect(component.getTitle({firstName: 'first', lastName: 'last', status: 'Pending'} as User)).toEqual('Pending administrator details');
      expect(component.getTitle({firstName: 'first', lastName: 'last', status: 'active'} as User)).toEqual('User');
      component.isSuperUser = false;
      expect(component.getTitle({firstName: 'first', lastName: 'last', status: 'Pending'} as User)).toEqual('Pending user details');
    });

    it('reinviteUser should dispatch reinvite pending user when is not super user', () => {
      component.isSuperUser = false;
      const expectedAction = new fromStore.ReinvitePendingUser();
      component.reinviteUser({firstName: 'first', lastName: 'last', status: 'Pending'} as User);
      expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('reinviteUser should dispatch SubmitReinviteUser pending user when is super user', () => {
      component.isSuperUser = true;
      component.orgId = 'orgId';
      const user = {firstName: 'first', lastName: 'last', status: 'Pending', email: 'test@email.com'} as User;
      const formValue = {
        firstName: user.firstName,
        lastName:  user.lastName,
        email: user.email,
        resendInvite: true,
        roles: [ ...AppConstants.SUPER_USER_ROLES]
      };
      const expectedAction = new fromStore.SubmitReinviteUser({organisationId: 'orgId', form: formValue});
      component.reinviteUser(user);
      expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch fromRoot.Back action on goBack', () => {
      const expectedAction = new fromRoot.Back();
      component.onGoBack();
      expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
