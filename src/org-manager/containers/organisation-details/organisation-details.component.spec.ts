import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, User } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';

import * as fromRoot from '../../../app/store';
import { PendingOrganisationsMockCollectionObj } from '../../mock/pending-organisation.mock';
import { OrganisationVM } from '../../models/organisation';
import * as fromOrganisationPendingStore from '../../store';
import { OrganisationDetailsComponent } from './organisation-details.component';


describe('OrganisationDetailsComponent', () => {

  let component: OrganisationDetailsComponent;
  let fixture: ComponentFixture<OrganisationDetailsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
            ExuiCommonLibModule,
            RouterTestingModule,
            CookieModule.forRoot(),
        ],
        declarations: [
          OrganisationDetailsComponent
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],
        providers: [
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(OrganisationDetailsComponent);
    component = fixture.componentInstance;

  }));

  it('should have a component', () => {
      expect(component).toBeTruthy();
  });

  it('on go back to active org when the organisation is active', () => {
    component.isActiveOrg = true;
    const expectedAction = new fromRoot.Go({ path: ['/active-organisation']});
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('on go back to pending org when the organisation is not active', () => {
    component.isActiveOrg = false;
    const expectedAction = new fromRoot.Go({ path: ['/pending-organisations']});
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should dispatch AddReviewOrganisations action on approveOrganisation', () => {
    const mockData: OrganisationVM = PendingOrganisationsMockCollectionObj;
    const expectedAction = new fromOrganisationPendingStore.AddReviewOrganisations(mockData);
    spyOn(store, 'dispatch').and.callThrough();

    component.approveOrganisation(null);
    expect(store.dispatch).toHaveBeenCalledTimes(0);

    component.approveOrganisation(mockData);
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

  });

  it('should set showUsersTab to true or false', () => {
    component.showUsersTab(false);
    expect(component.showUsers).toBeFalsy();

    component.showUsersTab(true);
    expect(component.showUsers).toBeTruthy();
  });

  it('should dispatch fromRoot.ShowUserDetails action on goBack when onShowUserDetails is called', () => {
    component.organisationAdminEmail = 'test@email.com';
    component.organisationId = 'orgId';
    const user = {firstName: 'first', lastName: 'last', email: 'test@email.com'} as User;
    const expectedAction = new fromOrganisationPendingStore.ShowUserDetails({userDetails: user, isSuperUser: true, orgId: 'orgId'});
    spyOn(store, 'dispatch').and.callThrough();
    component.onShowUserDetails(user);
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

});
