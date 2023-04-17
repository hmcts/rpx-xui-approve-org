import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { BackLinkComponent, OrganisationAddressComponent } from '../../components';
import {
  pendingOrganisationsMockCollection2,
  pendingOrganisationsMockCollectionObj,
  reviewOrganisationsMockCollection,
} from '../../mock/pending-organisation.mock';
import { DeleteOrganisation, DeletePendingOrganisation, DeleteReviewOrganisation } from '../../store';
import { DeleteOrganisationComponent } from './delete-organisation.component';

describe('DeleteOrganisationComponent', () => {
  let component: DeleteOrganisationComponent;
  let fixture: ComponentFixture<DeleteOrganisationComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let storePipeMock: any;
  let storeDispatchMock: any;

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
      const orgForReview = pendingOrganisationsMockCollection2[0];
      component.onDeleteOrganisationHandler(orgForReview);
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeletePendingOrganisation(orgForReview));
    });

    // TODO: this can be removed once the organisation delete endpoint allows 'under review organisation' has been developed
    it('should dispatch a review organisation "delete" action', () => {
      const orgForReview = reviewOrganisationsMockCollection[0];
      component.onDeleteOrganisationHandler(orgForReview);
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeleteReviewOrganisation(orgForReview));
    });

    it('should dispatch an (active) organisation "delete" action', () => {
      const orgForReview = pendingOrganisationsMockCollectionObj;
      component.onDeleteOrganisationHandler(orgForReview);
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeleteOrganisation(orgForReview));
    });
  });
});
