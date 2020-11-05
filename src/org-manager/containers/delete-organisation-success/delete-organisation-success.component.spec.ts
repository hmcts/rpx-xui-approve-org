import {DeleteOrganisationSuccessComponent} from './delete-organisation-success.component';
import {combineReducers, Store, StoreModule} from '@ngrx/store';
import * as fromOrganisationPendingStore from '../../../org-manager/store';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import * as fromRoot from '../../../app/store';
import {RouterTestingModule} from '@angular/router/testing';

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
    store = TestBed.get(Store);

    fixture = TestBed.createComponent(DeleteOrganisationSuccessComponent);
    component = fixture.componentInstance;
  }));

  it('should have a component', () => {
    const deleteOrganisationSuccessComponent = new DeleteOrganisationSuccessComponent(store);
    expect(deleteOrganisationSuccessComponent).toBeTruthy();
  });
});
