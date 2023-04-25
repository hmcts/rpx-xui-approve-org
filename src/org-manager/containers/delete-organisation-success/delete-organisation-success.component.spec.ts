import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { reviewedOrganisationMockCollection } from 'src/org-manager/mock/pending-organisation.mock';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { DeleteOrganisationSuccessComponent } from './delete-organisation-success.component';

describe('DeleteOrganisationSuccessComponent', () => {
  let component: DeleteOrganisationSuccessComponent;
  let fixture: ComponentFixture<DeleteOrganisationSuccessComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  let storePipeMock: any;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let storeDispatchMock: any;

  const reviewedOrganisationsDummy = reviewedOrganisationMockCollection;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers)
        }),
        RouterTestingModule
      ],
      declarations: [
        DeleteOrganisationSuccessComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);

    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DeleteOrganisationSuccessComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    const deleteOrganisationSuccessComponent = new DeleteOrganisationSuccessComponent(store);
    expect(deleteOrganisationSuccessComponent).toBeTruthy();
  });

  describe('addOrganisationForReviewSubscribe()', () => {
    it('should return reviewed organisation details, so that the User can view them on the page.', () => {
      storePipeMock.and.returnValue(of({ reviewedOrganisations: reviewedOrganisationsDummy }));
      fixture.detectChanges();
      component.addOrganisationForReviewSubscribe();
      // eslint-disable-next-line dot-notation
      expect(component.orgForReview['reviewedOrganisations']).toEqual(reviewedOrganisationsDummy);
    });
  });
});
