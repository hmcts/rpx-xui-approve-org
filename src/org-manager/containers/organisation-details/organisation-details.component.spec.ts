import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, User } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieService, CookieModule } from 'ngx-cookie';
import { PendingOrganisationsMockCollectionObj } from 'src/org-manager/mock/pending-organisation.mock';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
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

  it('should dispatch fromRoot.Back action on goBack when showUserDetails is false', () => {
    const expectedAction = new fromRoot.Back();
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
