import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { reducers } from '../index';
import { OrganisationState } from '../reducers/org-pending.reducer';
import { getPendingOrgs } from './org-pending.selectors';

describe('Pending Organisation selectors', () => {
  let store: Store<OrganisationState>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('approveOrg', reducers),
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
      expect(result).toEqual([]);
    });
  });
});
