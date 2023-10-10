import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import { UpdatePbaServices } from '../../../org-manager/services';
import { OrganisationService } from '../../services/organisation.service';
import * as fromOrganisationPendingStore from '../../store';
import { EditDetailsComponent } from './edit-details.component';

describe('EditDetailsComponent', () => {
  let component: EditDetailsComponent;
  let fixture: ComponentFixture<EditDetailsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let updatePbaServices: any;
  let mockedOrganisationService: any;

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

  const translationMockService = jasmine.createSpyObj('translationMockService', ['translate', 'getTranslation$']);

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers)
        }),
        ExuiCommonLibModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        EditDetailsComponent
      ],
      providers: [
        OrganisationService,
        { provide: RpxTranslationService, useValue: translationMockService },
        { provide: UpdatePbaServices },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orgId: 'orgTestId'
            })
          }
        }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
    store = TestBed.inject(Store);
    updatePbaServices = TestBed.inject(UpdatePbaServices);
    mockedOrganisationService = TestBed.inject(OrganisationService);
    spyOn(mockedOrganisationService, 'getSingleOrganisation').and.returnValue(of(MOCKED_ORGANISATION));
    fixture = TestBed.createComponent(EditDetailsComponent);
    component = fixture.componentInstance;
    spyOn(component, 'duplicateValidator').and.callThrough();
    spyOn(component, 'underscore').and.returnValue({
      uniq: () => ['PBA1234567', 'PBA1234567']
    });

    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('should change PBA after adding another item', () => {
    component.pbaInputs = [{
      label: 'test',
      hint: 'test',
      name: 'test',
      id: 'test',
      type: 'test',
      classes: 'test'
    }];
    fixture.detectChanges();
    component.onAddNewBtnClicked();
    fixture.detectChanges();
    expect(component.duplicateValidator).toHaveBeenCalled();
  });

  it('should remove PBA after adding one', () => {
    component.onAddNewBtnClicked();
    fixture.detectChanges();
    component.remove(component.pbaInputs[0]);
    fixture.detectChanges();
    expect(component.pbaInputs.length).toBe(0);
  });

  it('should submit PBA and reset errors', () => {
    component.onAddNewBtnClicked();
    fixture.detectChanges();
    component.onSubmitPba();
    expect(component.errorHeader.items.length).toBe(0);
  });

  it('should submit PBA and reset errors', () => {
    expect(component.pbaDepiction('PBANumber:PBA12 34567')).toBe('PBA12');
  });

  it('should submit PBA and reset errors', () => {
    expect(component.pbaDepiction('PBANumber')).toBe('');
  });

  it('should dispatch route to back', () => {
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(new fromRoot.Back());
  });

  it('should return PendingPaymentAccount', () => {
    const response = {
      pendingAddPaymentAccount: ['PBA1234564', 'PBA5462541'],
      pendingRemovePaymentAccount: []
    };
    expect(component.pendingChanges(['PBA1234564', 'PBA5462541'])).toEqual(response);
  });
});
