import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { CookieModule } from 'ngx-cookie';
import { of } from 'rxjs';
import { OrganisationService, PbaAccountDetails } from 'src/org-manager/services';

import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { NewPBAsComponent } from './new-pbas.component';


fdescribe('NewPBAsComponent', () => {

  let component: NewPBAsComponent;
  let fixture: ComponentFixture<NewPBAsComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let mockedOrganisationService: any;
  let mockedPbaAccountDetails: any;

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
      ],
      declarations: [
        NewPBAsComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        OrganisationService, PbaAccountDetails,
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
