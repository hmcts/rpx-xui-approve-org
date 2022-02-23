import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';
import { of } from 'rxjs';
import { OrganisationService, PbaAccountDetails } from 'src/org-manager/services';
import * as fromRoot from '../../../app/store';
import { PbaService } from '../../services/pba.service';
import * as fromOrganisationPendingStore from '../../store';
import { NewPBAsComponent } from './new-pbas.component';

fdescribe('NewPBAsComponent', () => {
  let component: NewPBAsComponent;
  let fixture: ComponentFixture<NewPBAsComponent>;
  let mockedOrganisationService: any;
  let mockedPbaAccountDetails: any;
  let mockedPbaService: any;
  let mockedPBARouter: any;
  class RouterStub {
    public url = '';
    public navigate(commands: any[], extras?: any) { }
  }

  const MOCKED_PBA = [
    {
      organisationIdentifier: 'R2JZ53Y',
      status: 'PENDING',
      pbaNumbers: [
        {
          pbaNumber: 'PBAmrbXJtc',
          status: 'PENDING',
          statusMessage: null,
          dateCreated: '2019-08-15T11:56:58.869',
        }]
    }];

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ExuiCommonLibModule,
        RouterTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'organisation/pbas', component: NewPBAsComponent }
        ]),
        CookieModule.forRoot(),
      ],
      declarations: [
        NewPBAsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        OrganisationService, PbaAccountDetails, PbaService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              orgId: 'orgTestId',
            }),
          },
        }
      ]
    }).compileComponents();
    mockedOrganisationService = TestBed.get(OrganisationService);
    mockedPbaAccountDetails = TestBed.get(PbaAccountDetails);
    mockedPbaService = TestBed.get(PbaService);
    mockedPBARouter = TestBed.get(Router);
    spyOn(mockedPbaService, 'getPBAsByStatus').and.returnValue(of(MOCKED_PBA));
    spyOn(mockedPBARouter, 'navigateByUrl').and.returnValue(() => { });
    fixture = TestBed.createComponent(NewPBAsComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    expect(component).toBeTruthy();
  });

  it('should go back to the pba list when the organisation is active and on the Approve new PBA number page', () => {
    const expectedAction = '/organisation/pbas';
    component.confirmDecision = false;
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).toHaveBeenCalledWith(expectedAction);
  });

  it('should not go back to pba list when on the PBA Confirm your decision page', () => {
    component.confirmDecision = true;
    component.onGoBack();
    expect(mockedPBARouter.navigateByUrl).not.toHaveBeenCalled();
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
