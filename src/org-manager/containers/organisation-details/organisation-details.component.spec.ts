import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule, User } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';
import { UserApprovalGuard } from 'src/org-manager/guards';
import { OrganisationService, PbaAccountDetails } from 'src/org-manager/services';
import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { OrganisationDetailsComponent } from './organisation-details.component';

@Component({
  selector: 'app-mock',
  template: ''
})
class MockComponent {
}

fdescribe('OrganisationDetailsComponent', () => {
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

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers),
        }),
        HttpClientTestingModule,
        ExuiCommonLibModule,
        RouterTestingModule,
        CookieModule.forRoot(),
        RouterTestingModule.withRoutes(
          [
            { path: 'active-organisation', component: MockComponent },
            { path: 'pending-organisations', component: MockComponent }
          ]
        )
      ],
      declarations: [
        OrganisationDetailsComponent, MockComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        OrganisationService, PbaAccountDetails, UserApprovalGuard,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orgId: 'orgTestId',
            }),
          },
        },
      ]
    }).compileComponents();
    store = TestBed.get(Store);
    mockedOrganisationService = TestBed.get(OrganisationService);
    mockedPbaAccountDetails = TestBed.get(PbaAccountDetails);
    mockedUserApprovalGuard = TestBed.get(UserApprovalGuard);
    mockedPBARouter = TestBed.get(Router);
    spyOn(mockedUserApprovalGuard, 'isUserApprovalRole').and.returnValue(true);
    spyOn(mockedOrganisationService, 'getSingleOrganisation').and.returnValue(of(MOCKED_ORGANISATION));
    spyOn(mockedOrganisationService, 'getOrganisationUsers').and.returnValue(of(MOCKED_USERS));
    spyOn(mockedOrganisationService, 'getOrganisationDeletableStatus').and.returnValue(of('true'));
    spyOn(mockedPbaAccountDetails, 'getAccountDetails').and.returnValue(of(MOCKED_ACCOUNTS));
    spyOn(mockedPBARouter, 'navigateByUrl').and.returnValue(of(MOCKED_ACCOUNTS));
    fixture = TestBed.createComponent(OrganisationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('on go back to active org when the organisation is active', () => {
    component.isActiveOrg = true;
    new fromRoot.Go({ path: ['/active-organisation'] });
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('on go back to pending org when the organisation is not active', () => {
    component.isActiveOrg = false;
    new fromRoot.Go({ path: ['/pending-organisations'] });
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalled();
  });

  it('should set showUsersTab to true or false', () => {
    component.showUsersTab(false);
    expect(component.showUsers).toBeFalsy();

    component.showUsersTab(true);
    expect(component.showUsers).toBeTruthy();
  });
});
