import * as fromRoot from '../../../app/store';
import { ReinviteUserSuccessComponent } from './reinvite-user-success.component';

describe('ReinviteUserSuccessComponent', () => {

    let component: ReinviteUserSuccessComponent;
    let userStoreSpyObject;

    beforeEach(() => {
        userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
        component = new ReinviteUserSuccessComponent(userStoreSpyObject);
    });

    it('Is Truthy', () => {
        expect(component).toBeTruthy();
    });

    it('should dispatch fromRoot.Back action on goBack', () => {
      component.orgId = 'orgId';
      const expectedAction = new fromRoot.Go({ path: ['/organisation-details', 'orgId'] });
      component.onGoBack();
      expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
