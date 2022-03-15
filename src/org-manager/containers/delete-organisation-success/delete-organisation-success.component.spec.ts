import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {combineReducers, Store, StoreModule} from '@ngrx/store';
import {DeleteOrganisationSuccessComponent} from './delete-organisation-success.component';
import * as fromRoot from '../../../app/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';

describe('DeleteOrganisationSuccessComponent', () => {
  let component: DeleteOrganisationSuccessComponent;
  let fixture: ComponentFixture<DeleteOrganisationSuccessComponent>;
  let store: Store<fromOrganisationPendingStore.OrganisationRootState>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          ...fromRoot.reducers,
          feature: combineReducers(fromOrganisationPendingStore.reducers),
        }),
        RouterTestingModule,
      ],
      declarations: [
        DeleteOrganisationSuccessComponent
      ]
    }).compileComponents();
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(DeleteOrganisationSuccessComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    const deleteOrganisationSuccessComponent = new DeleteOrganisationSuccessComponent(store);
    expect(deleteOrganisationSuccessComponent).toBeTruthy();
  });
});
