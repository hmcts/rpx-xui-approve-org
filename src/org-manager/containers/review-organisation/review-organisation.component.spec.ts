import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { Go } from '../../../app/store/actions';
import * as fromRoot from '../../../app/store/reducers';
import { BackLinkComponent } from '../../../org-manager/components';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { ReviewedOrganisationMockCollection } from '../../mock/pending-organisation.mock';
import { ReviewOrganisationComponent } from './review-organisation.component';

describe('ReviewOrganisationComponent', () => {
  let component: ReviewOrganisationComponent;
  let fixture: ComponentFixture<ReviewOrganisationComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let storePipeMock: any;
  let storeDispatchMock: any;
  const reviewedOrganisationsDummy = ReviewedOrganisationMockCollection;

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
        ReviewOrganisationComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);
    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ReviewOrganisationComponent);
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
});
