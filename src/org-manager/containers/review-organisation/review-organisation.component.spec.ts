import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import { BackLinkComponent } from '../../../org-manager/components';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { ReviewOrganisationComponent } from './review-organisation.component';

describe('ReviewOrganisationComponent', () => {
  let component: ReviewOrganisationComponent;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let storePipeMock: any;
  let storeDispatchMock: any;
  let router;

  beforeEach((() => {
    router = jasmine.createSpyObj('router', ['navigate', 'getCurrentNavigation']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers)
        })
      ],
      declarations: [
        BackLinkComponent,
        ReviewOrganisationComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);
    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
    component = new ReviewOrganisationComponent(storeDispatchMock, router);
  }));

  it('should dispatch fromRoot.Back action on goBack', () => {
    component.onPutReviewOrganisation();
    expect(storeDispatchMock.dispatch).toHaveBeenCalled();
  });
});
