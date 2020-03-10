import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, User } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { PendingOrganisationsMockCollectionObj } from 'src/org-manager/mock/pending-organisation.mock';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { OrganisationDetailsComponent } from './organisation-details.component';
import { CookieService, CookieModule } from 'ngx-cookie';


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
            CookieModule.forRoot()
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
    component.showUserDetails = false;
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });


  it('should dispatch fromRoot.Back action on goBack when showUserDetails is true', () => {
    component.showUserDetails = true;
    component.onGoBack();
    expect(component.showUserDetails).toBeFalsy();
    expect(component.userDetails).toBeNull();
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

  it('should assigned users when onShowUserDetails', () => {
    component.onShowUserDetails(null);
    expect(component.showUserDetails).toBeFalsy();
    expect(component.userDetails).toBeNull();

    const mockUserResult: User = {
      fullName: 'hello world',
      email: 'test@test.com',
      resendInvite: false,
      status: 'Active',
      ['manageCases']: 'Yes',
      ['manageUsers']: 'Yes',
      ['manageOrganisations']: 'No'
    };
    component.onShowUserDetails(mockUserResult);
    expect(component.showUserDetails).toBeTruthy();
    expect(component.userDetails).toEqual(mockUserResult);
  });

});
