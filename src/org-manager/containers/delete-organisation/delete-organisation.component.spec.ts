import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';

import { Go } from '../../../app/store/actions';
import * as fromRoot from '../../../app/store/reducers';
import { BackLinkComponent } from '../../../org-manager/components';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { OrganisationAddressComponent } from '../../components/organisation-address';
import {
  ActiveOrganisationMockCollection,
  PendingOrganisationsMockCollection2,
  PendingOrganisationsMockCollectionObj,
  ReviewedOrganisationMockCollection,
} from '../../mock/pending-organisation.mock';
import { DeleteOrganisation, DeletePendingOrganisation } from '../../store/actions';
import { DeleteOrganisationComponent } from './delete-organisation.component';

describe('DeleteOrganisationComponent', () => {
  let component: DeleteOrganisationComponent;
  let fixture: ComponentFixture<DeleteOrganisationComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let storePipeMock: any;
  let storeDispatchMock: any;
  const reviewedOrganisationsDummy = ReviewedOrganisationMockCollection;
  const activeOrganisationsDummy = ActiveOrganisationMockCollection;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers),
        }),
      ],
      declarations: [
        BackLinkComponent,
        DeleteOrganisationComponent,
        OrganisationAddressComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);

    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DeleteOrganisationComponent);
    component = fixture.componentInstance;
  }));

  describe('onDeleteOrganisation()', () => {

    it('should dispatch a pending organisation "delete" action', () => {
      const orgForReview = PendingOrganisationsMockCollection2[0];
      component.onDeleteOrganisationHandler(orgForReview);
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeletePendingOrganisation(orgForReview));
    });

    it('should dispatch an (active) organisation "delete" action', () => {
      const orgForReview = PendingOrganisationsMockCollectionObj;
      component.onDeleteOrganisationHandler(orgForReview);
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeleteOrganisation(orgForReview));
    });
  });
});
