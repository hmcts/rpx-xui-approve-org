import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { combineReducers, Store, StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../app/store/reducers';
import { BackLinkComponent } from '../../../org-manager/components';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import { ReviewOrganisationComponent } from './review-organisation.component';

describe('ReviewOrganisationComponent', () => {
  let component: ReviewOrganisationComponent;
  let fixture: ComponentFixture<ReviewOrganisationComponent>;
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
        ReviewOrganisationComponent
      ]
    }).compileComponents();
    store = TestBed.get(Store);
    storePipeMock = spyOn(store, 'pipe');
    storeDispatchMock = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ReviewOrganisationComponent);
    component = fixture.componentInstance;
  }));
});
