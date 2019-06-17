import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { PendingOrganisationState } from '../reducers/org-pending.reducer';
import { getPendingOrgs } from './org-pending.selectors';
import { reducers } from '../index';

describe('Pending Organisation selectors', () => {
  let store: Store<PendingOrganisationState>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('org-pending', reducers),
      ],
    });
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  describe('getPendingOrganisationState', () => {
    it('should return organisation state', () => {
      let result;
      store.pipe(select(getPendingOrgs)).subscribe(value => {
        result = value.pendingOrganisations;
      });
      expect(result).toEqual({ pendingOrganisations: null, reviewedOrganisations: null, loaded: false, loading: false });
    });
  });
});
