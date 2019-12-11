import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { OrganisationState } from '../reducers/organisation.reducer';
import { getOrganisationsState, selectedOrganisation } from './organisation.selectors';
import { reducers } from '../index';

describe('Organisation selectors', () => {
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

  describe('getOrganisationState', () => {
    it('should return organisation state', () => {
      let result;
      store.pipe(select(getOrganisationsState)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual({ organisations: null, loaded: false, loading: false });
    });
  });

  describe('selectedOrganisation', () => {
    it('should return blank organisation', () => {
      let result;
      store.pipe(select(selectedOrganisation)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual({});
    });
  });

});
