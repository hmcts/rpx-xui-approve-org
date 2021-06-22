import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { reducers } from '../index';
import { OrganisationState as organisationState } from '../reducers/organisation.reducer';
import * as fromSelectors from './organisation.selectors';

const organisationState = {
  activeOrganisations: {
    orgEntities: {},
    loaded: false,
    loading: false,
    searchString: ''
  },
  pendingOrganisations: {
    orgEntities: {},
    loaded: false,
    loading: false,
    searchString: ''
  },
  errorMessage: '',
  orgForReview: null,
  organisationUsersList: { users: null, isError: false },
  showOrganisationDetailsUserTab: {orgId: null, showUserTab: false},
  organisationDeletable: false,
  searchString: ''
};

describe('Organisation selectors', () => {
  let store: Store<organisationState>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('orgState', reducers),
      ],
    });
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  describe('getOrganisationState', () => {
    it('should return organisation state', () => {
      let result;
      store.pipe(select(fromSelectors.getOrganisationsState)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(organisationState);
    });
  });

  describe('getActiveOrganisationArray', () => {
    it('should return an array', () => {
      let result;
      store.pipe(select(fromSelectors.getActiveOrganisationArray)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual([]);
    });
  });

  describe('getActiveLoaded', () => {
    it('should return boolian ', () => {
      let result;
      store.pipe(select(fromSelectors.getActiveLoaded)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(false);
    });
  });

  describe('getActiveLoading', () => {
    it('should return boolian ', () => {
      let result;
      store.pipe(select(fromSelectors.getActiveLoading)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(false);
    });
  });

  describe('getPendingOrganisationsState', () => {
    it('should return inital state ', () => {
      let result;
      store.pipe(select(fromSelectors.getPendingOrganisationsState)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual({loading: false, loaded: false, orgEntities: {}, searchString: ''});
    });
  });

  describe('getPendingOrganisations', () => {
    it('should return entities', () => {
      let result;
      store.pipe(select(fromSelectors.getPendingOrganisations)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual({});
    });
  });

  describe('getPendingOrganisationsArray', () => {
    it('should return array', () => {
      let result;
      store.pipe(select(fromSelectors.getPendingOrganisationsArray)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual([]);
    });
  });

  describe('getPendingLoaded', () => {
    it('should return boolean', () => {
      let result;
      store.pipe(select(fromSelectors.getPendingLoaded)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return empty string', () => {
      let result;
      store.pipe(select(fromSelectors.getErrorMessage)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual('');
    });
  });

  describe('getOrganisationForReview', () => {
    it('should return null', () => {
      let result;
      store.pipe(select(fromSelectors.getOrganisationForReview)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(null);
    });
  });

  describe('pendingOrganisationsCount', () => {
    it('should return null', () => {
      let result;
      store.pipe(select(fromSelectors.pendingOrganisationsCount)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(0);
    });
  });

  describe('getAllLoaded', () => {
    it('should return boolean', () => {
      let result;
      store.pipe(select(fromSelectors.getAllLoaded)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(false);
    });
  });

  describe('getOrganisationDeletable', () => {
    it('should return boolean', () => {
      let result;
      store.pipe(select(fromSelectors.getOrganisationDeletable)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(false);
    });
  });

  describe('getSearchString', () => {
    it('should return string', () => {
      let result;
      store.pipe(select(fromSelectors.getSearchString)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual('');
    });
  });
});
