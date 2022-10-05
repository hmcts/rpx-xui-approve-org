import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import { ReinviteUserSuccessComponent } from './reinvite-user-success.component';

xdescribe('ReinviteUserSuccessComponent', () => {

    let component: ReinviteUserSuccessComponent;
    let userStoreSpyObject;

    beforeEach(() => {
        userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
        component = new ReinviteUserSuccessComponent(userStoreSpyObject);
    });

    it('Is Truthy', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit()', () => {
        it('should set the email field', () => {
            const testEmail$ = of('hello@me.co.uk');
            userStoreSpyObject.pipe.and.returnValue(testEmail$);

            component.ngOnInit();

            expect(component.email$).toEqual(testEmail$);
        });

        it('should set the orgId field', () => {
            const orgId = 'hello';
            userStoreSpyObject.pipe.and.returnValue(of(orgId));

            component.ngOnInit();

            expect(component.orgId).toEqual('hello');
        });
    });

    it('should dispatch fromRoot.Back action on goBack', () => {
        component.orgId = 'orgId';
        const expectedAction = new fromRoot.Go({ path: ['/organisation-details', 'orgId'] });
        component.onGoBack();
        expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
