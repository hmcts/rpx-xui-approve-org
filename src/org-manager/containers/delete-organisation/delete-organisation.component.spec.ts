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
    store = TestBed.get(Store);

    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DeleteOrganisationComponent);
    component = fixture.componentInstance;
  }));

  describe('addOrganisationForReviewSubscribe()', () => {

    it('should return reviewed organisation details, so that the User can view them on the page.', () => {

      storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
      fixture.detectChanges();
      component.addOrganisationForReviewSubscribe();
      expect(component.orgForReview['reviewedOrganisations']).toEqual(reviewedOrganisationsDummy);
    });

    it('should dispatch a router "back" action when there are no organisation details.', () => {
      storePipeMock.and.returnValue(of(false));
      fixture.detectChanges();
      component.addOrganisationForReviewSubscribe();
      expect(storeDispatchMock).toHaveBeenCalledWith(new Go({path: ['/pending-organisations']}));
    });
  });

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
