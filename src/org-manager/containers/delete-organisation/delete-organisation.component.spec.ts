import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DeleteOrganisationComponent} from './delete-organisation.component';
import {RouterTestingModule} from '@angular/router/testing';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
// TODO: This needs to be improved as the files referenced are slightly difference from the production code.
import * as fromRoot from '../../../app/store/reducers';
import {combineReducers, Store, StoreModule} from '@ngrx/store';
import {of} from 'rxjs';
import {ActiveOrganisationMockCollection, ReviewedOrganisationMockCollection} from '../../mock/pending-organisation.mock';
import {BackLinkComponent} from 'src/org-manager/components';
import {DeletePendingOrganisation} from '../../store/actions';
import {Go} from '../../../app/store/actions';

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
        DeleteOrganisationComponent
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
      // storePipeMock.and.returnValue(of({reviewedOrganisations: reviewedOrganisationsDummy}));
      // fixture.detectChanges();
      const orgForReview = activeOrganisationsDummy[0];
      component.onDeleteOrganisationHandler(orgForReview);
      // fixture.detectChanges();
      expect(storeDispatchMock).toHaveBeenCalledWith(new DeletePendingOrganisation(orgForReview));
    });
  });
});
