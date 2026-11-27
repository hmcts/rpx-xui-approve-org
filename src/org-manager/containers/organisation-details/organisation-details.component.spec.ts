import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, FeatureToggleService, User } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable, of, Subject } from 'rxjs';

import * as fromRoot from '../../../app/store';
import { UserApprovalGuard } from '../../../org-manager/guards';
import { OrganisationVM } from '../../../org-manager/models/organisation';
import { OrganisationService, PbaAccountDetails, UsersService } from '../../../org-manager/services';
import * as fromOrganisationPendingStore from '../../store';
import { OrganisationDetailsComponent } from './organisation-details.component';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  selector: 'app-mock',
  template: '',
  standalone: false
})
class MockComponent { }

describe('OrganisationDetailsComponent', () => {
  const MOCKED_ORGANISATION = {
    name: 'KapilgI2qEnW67CPGZrHvbTxt JainqyXJo07tRocHYtq2Ci0o',
    organisationIdentifier: 'NW1U3XB',
    contactInformation: [
      {
        addressId: '6db39256-2a23-47ae-b189-e6cddb1e0773',
        uprn: null,
        created: '2020-02-25T22:02:50.166',
        addressLine1: '898 high road',
        addressLine2: 'qQvwFQMQyJeIBsBDSpmH qu7mIFeGBizMp45opSfj',
        addressLine3: 'Maharaj road',
        townCity: 'West Kirby',
        county: 'Wirral',
        country: 'UK',
        postCode: 'TEST1',
        dxAddress: [
          {
            dxNumber: 'DX 1121111990',
            dxExchange: '112111192099908492'
          }
        ]
      }
    ],
    status: 'ACTIVE',
    sraId: 'TRAl97YUHcGqstqpQ3',
    sraRegulated: true,
    companyNumber: 'EzdZEd3P',
    companyUrl: 'www.trxdj6vkMXGN2C4XT.com',
    superUser: {
      firstName: 'qQvwFQMQyJeIBsBDSpmH',
      lastName: 'qu7mIFeGBizMp45opSfj',
      email: 'tpawzmujvlikoqitql@email.co.uk'
    },
    paymentAccount: [
      'PBA4U2PVOH',
      'PBAA1X2TGM'
    ]
  };

  const MOCKED_ACCOUNTS = [{ account_name: 'not found' }, { account_name: 'not found' }];

  const MOCKED_USERS = {
    organisationIdentifier: 'NW1U3XB',
    users: [
      {
        userIdentifier: '7af325d1-49d3-4b27-9113-1583915364fb',
        firstName: 'qQvwFQMQyJeIBsBDSpmH',
        lastName: 'qu7mIFeGBizMp45opSfj',
        email: 'tpawzmujvlikoqitql@email.co.uk',
        idamStatus: 'ACTIVE',
        roles: null,
        idamStatusCode: '404',
        idamMessage: 'The user could not be found: 7af325d1-49d3-4b27-9113-1583915364fb'
      }
    ]
  };
  let component: OrganisationDetailsComponent;
  let fixture: ComponentFixture<OrganisationDetailsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let mockedOrganisationService: any;
  let mockedPbaAccountDetails: any;
  let mockedUserApprovalGuard: any;
  let mockedPBARouter: any;
  let featureToggleServiceMock: any;
  let pagedUsersResponse: Subject<typeof MOCKED_USERS>;
  let allUsersResponse: Subject<typeof MOCKED_USERS>;
  const organisationVM: OrganisationVM = {
    organisationId: '123',
    status: 'valid',
    admin: 'Glen Byrne',
    firstName: 'Glen',
    lastName: 'Byrne',
    adminEmail: 'test@mail.com',
    addressLine1: 'AddressLine1',
    addressLine2: 'AddressLine2',
    townCity: 'Sutton',
    county: 'Surrey',
    name: 'Glen Byrne',
    view: 'View',
    pbaNumber: ['PBA1234567'],
    dxNumber: [123456]
  };
  const translationMockService = jasmine.createSpyObj('translationMockService', ['translate', 'getTranslation$']);

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [
        OrganisationDetailsComponent, MockComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      imports: [StoreModule.forRoot({
        ...fromRoot.reducers,
        feature: combineReducers(fromOrganisationPendingStore.reducers)
      }),
      ExuiCommonLibModule,
      RouterTestingModule,
      CookieModule.forRoot(),
      RouterTestingModule.withRoutes([
        { path: 'active-organisation', component: MockComponent },
        { path: 'pending-organisations', component: MockComponent }
      ])],
      providers: [
        OrganisationService, PbaAccountDetails, UserApprovalGuard, UsersService,
        { provide: RpxTranslationService, useValue: translationMockService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orgId: 'orgTestId'
            })
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    store = TestBed.inject(Store);
    mockedOrganisationService = TestBed.inject(OrganisationService);
    mockedPbaAccountDetails = TestBed.inject(PbaAccountDetails);
    mockedUserApprovalGuard = TestBed.inject(UserApprovalGuard);
    mockedPBARouter = TestBed.inject(Router);
    featureToggleServiceMock = TestBed.inject(FeatureToggleService);
    spyOn(mockedUserApprovalGuard, 'isUserApprovalRole').and.returnValue(true);
    spyOn(mockedOrganisationService, 'getSingleOrganisation').and.returnValue(of(MOCKED_ORGANISATION));
    pagedUsersResponse = new Subject();
    allUsersResponse = new Subject();
    spyOn(mockedOrganisationService, 'getOrganisationUsers').and.returnValue(pagedUsersResponse.asObservable());
    spyOn(TestBed.inject(UsersService), 'getAllUsersList').and.returnValue(allUsersResponse.asObservable());
    spyOn(mockedOrganisationService, 'getOrganisationDeletableStatus').and.returnValue(of('true'));
    spyOn(mockedPbaAccountDetails, 'getAccountDetails').and.returnValue(of(MOCKED_ACCOUNTS));
    spyOn(mockedPBARouter, 'navigateByUrl').and.returnValue(of(MOCKED_ACCOUNTS));
    spyOn(store, 'dispatch').and.callThrough();
    spyOn(featureToggleServiceMock, 'getValue').and.returnValue(of(true));
    fixture = TestBed.createComponent(OrganisationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('on go back to active org when the organisation is active', () => {
    component.isActiveOrg = true;
    // const response = new fromRoot.Go({ path: ['/active-organisation'] });
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('on go back to pending org when the organisation is not active', () => {
    component.isActiveOrg = false;
    // const response = new fromRoot.Go({ path: ['/pending-organisations'] });
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should set showUsersTab to true or false', () => {
    component.showUsersTab(false);
    expect(component.showUsers).toBeFalsy();

    component.showUsersTab(true);
    expect(component.showUsers).toBeTruthy();
  });

  it('shows an explicit empty Users state for a known organisation', () => {
    component.showUsersTab(true);
    pagedUsersResponse.next({ ...MOCKED_USERS, users: [] });
    allUsersResponse.next({ ...MOCKED_USERS, users: [] });
    allUsersResponse.complete();
    fixture.detectChanges();

    expect(component.pageTotalSize).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('There are no users in this organisation.');
    expect(fixture.nativeElement.textContent).not.toContain('Loading...');
    expect(fixture.nativeElement.querySelector('xuilib-user-list')).toBeNull();
  });

  it('shows users when the page and count requests succeed', () => {
    component.showUsersTab(true);
    allUsersResponse.next(MOCKED_USERS);
    pagedUsersResponse.next(MOCKED_USERS);
    fixture.detectChanges();

    expect(component.pageTotalSize).toBe(1);
    expect(fixture.nativeElement.querySelector('xuilib-user-list')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Sorry, there is a problem with the service');
  });

  it('shows the service error when the Users request fails', () => {
    component.showUsersTab(true);
    pagedUsersResponse.error(new HttpErrorResponse({ status: 503 }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sorry, there is a problem with the service');
    expect(fixture.nativeElement.textContent).not.toContain('There are no users in this organisation.');
  });

  for (const status of [0, 503]) {
    for (const countFailsFirst of [true, false]) {
      it(`shows the service error when the user count fails with ${status} (${countFailsFirst ? 'before' : 'after'} the page)`, () => {
        component.showUsersTab(true);
        if (!countFailsFirst) {
          pagedUsersResponse.next(MOCKED_USERS);
        }
        allUsersResponse.error(new HttpErrorResponse({ status }));
        if (countFailsFirst) {
          pagedUsersResponse.next(MOCKED_USERS);
        }
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Sorry, there is a problem with the service');
        expect(fixture.nativeElement.querySelector('xuilib-user-list')).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain('There are no users in this organisation.');
      });
    }
  }

  it('shows the service error when the user count response is malformed', () => {
    component.showUsersTab(true);
    pagedUsersResponse.next(MOCKED_USERS);
    allUsersResponse.next({ ...MOCKED_USERS, users: null });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sorry, there is a problem with the service');
    expect(fixture.nativeElement.querySelector('xuilib-user-list')).toBeNull();
  });

  it('keeps the user count error visible when changing page', () => {
    component.showUsersTab(true);
    allUsersResponse.error(new HttpErrorResponse({ status: 503 }));
    component.pageChange(2);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sorry, there is a problem with the service');
  });

  it('should return approve organisation link', () => {
    component.approveOrganisation(organisationVM);
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should return delete organisation link', () => {
    component.deleteOrganisation(organisationVM);
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should return review organisation link', () => {
    component.reviewOrganisation(organisationVM);
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should show user details', () => {
    const user: User = {
      ['key']: 'test1',
      routerLink: '/test/test1',
      routerLinkTitle: 'Tets',
      fullName: 'Rowdy Rathore',
      email: 'test@mail.com',
      status: 'valid',
      resendInvite: false
    };
    component.onShowUserDetails(user);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should return pageNumber', () => {
    component.pageChange(2);
    expect(component.currentPageNumber).toEqual(2);
    expect(store.dispatch).toHaveBeenCalled();
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from observables when subscribed', () => {
      component.orgTypeSubscription = new Observable().subscribe();
      const componentOrgTypeSubscriptionUnsubscribeSpy = spyOn(component.orgTypeSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(componentOrgTypeSubscriptionUnsubscribeSpy).toHaveBeenCalled();
    });

    it('should not unsubscribe from observables when not subscribed', () => {
      component.orgTypeSubscription = new Observable().subscribe();
      const componentOrgTypeSubscriptionUnsubscribeSpy = spyOn(component.orgTypeSubscription, 'unsubscribe');
      component.orgTypeSubscription = undefined;
      component.ngOnDestroy();
      expect(componentOrgTypeSubscriptionUnsubscribeSpy).not.toHaveBeenCalled();
    });
  });
});
