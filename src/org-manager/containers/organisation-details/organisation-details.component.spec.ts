import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { PendingOrganisationsMockCollectionObj } from 'src/org-manager/mock/pending-organisation.mock';
import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../store';
import { OrganisationDetailsComponent } from './organisation-details.component';


let component: OrganisationDetailsComponent;
let fixture: ComponentFixture<OrganisationDetailsComponent>;
let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
describe('SummaryComponent', () => {
  beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
            StoreModule.forRoot({
                ...fromRoot.reducers,
                feature: combineReducers(fromOrganisationPendingStore.reducers),
            }),
            ExuiCommonLibModule,
            RouterTestingModule,
        ],
        declarations: [
          OrganisationDetailsComponent
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ]
    }).compileComponents();
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(OrganisationDetailsComponent);
    component = fixture.componentInstance;

  }));

  it('should have a component', () => {
      expect(component).toBeTruthy();
  });

  it('should dispatch fromRoot.Back action on goBack', () => {
    const expectedAction = new fromRoot.Back();
    spyOn(store, 'dispatch').and.callThrough();
    component.onGoBack();
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should dispatch AddReviewOrganisations action on approveOrganisation', () => {
    const mockData: OrganisationVM = PendingOrganisationsMockCollectionObj;
    const expectedAction = new fromOrganisationPendingStore.AddReviewOrganisations(mockData);
    spyOn(store, 'dispatch').and.callThrough();
    component.approveOrganisation(mockData);
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

});
