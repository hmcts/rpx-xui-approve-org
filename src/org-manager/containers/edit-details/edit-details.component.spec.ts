import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { of } from 'rxjs';
import { OrganisationService, PbaAccountDetails, UpdatePbaServices } from 'src/org-manager/services';
import { EditDetailsComponent } from './edit-details.component';

fdescribe('EditDetailsComponent', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;
  let mockedOrganisationService: any;
  let mockedPbaAccountDetails: any;
  let mockedUpdatePbaServices: any;

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

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ExuiCommonLibModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        EditDetailsComponent,
      ],
      providers: [
        OrganisationService, PbaAccountDetails, UpdatePbaServices,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orgId: 'orgTestId',
            }),
          },
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
    mockedOrganisationService = TestBed.get(OrganisationService);
    mockedPbaAccountDetails = TestBed.get(PbaAccountDetails);
    mockedUpdatePbaServices = TestBed.get(UpdatePbaServices);
    spyOn(mockedOrganisationService, 'getSingleOrganisation').and.returnValue(of(MOCKED_ORGANISATION));
    fixture = TestBed.createComponent(EditDetailsComponent);
    component = fixture.componentInstance;

  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });
});

