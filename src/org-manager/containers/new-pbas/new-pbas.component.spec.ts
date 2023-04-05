import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';
import { of } from 'rxjs';
import * as fromRoot from '../../../app/store';
import { OrganisationService } from '../../services/organisation.service';
import { PbaAccountDetails } from '../../services/pba-account-details.services';
import * as fromOrganisationPendingStore from '../../store';
import { NewPBAsComponent } from './new-pbas.component';

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

describe('NewPBAsComponent', () => {
  let component: NewPBAsComponent;
  let fixture: ComponentFixture<NewPBAsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let mockedOrganisationService: any;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers),
        }),
        ExuiCommonLibModule,
        RouterTestingModule,
        CookieModule.forRoot(),
      ],
      declarations: [
        NewPBAsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        OrganisationService,
        PbaAccountDetails
      ]
    }).compileComponents();
    mockedOrganisationService = TestBed.inject(OrganisationService);
    spyOn(mockedOrganisationService, 'getSingleOrganisation').and.returnValue(of(MOCKED_ORGANISATION));
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(NewPBAsComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('should go back to the pba list when the organisation is active and on the Approve new PBA number page', () => {
    const expectedAction = new fromRoot.Go({ path: ['/organisation/pbas'] });
    component.confirmDecision = false;
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should not go back to pba list when on the PBA Confirm your decision page', () => {
    component.confirmDecision = true;
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should set the confirm decision state when the continue button is clicked', () => {
    component.onContinue();
    expect(component.confirmDecision).toEqual(true);
  });

  it('should add the new PBA to the PBA dictionary', () => {
    component.setNewPBA({ name: 'test', value: 'test value' });
    const result = component.newPBAs.get('test');
    expect(result).toEqual('test value');
  });

  it('should update a PBA if it already exists in the PBA dictionary', () => {
    component.setNewPBA({ name: 'test', value: 'test value OLD' });
    component.setNewPBA({ name: 'test', value: 'test value NEW' });
    const result = component.newPBAs.get('test');
    expect(result).toEqual('test value NEW');
  });
});
