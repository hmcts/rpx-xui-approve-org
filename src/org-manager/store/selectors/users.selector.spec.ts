import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { reducers } from '../index';
import {initialState, UsersState} from '../reducers/users.reducer';
import * as fromSelectors from './users.selectors';

describe('Edit Details selectors', () => {
  let store: Store<UsersState>;
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

  describe('getUsersState', () => {
    it('should return initial state', () => {
      let result;
      store.pipe(select(fromSelectors.getUsersState)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(initialState);
    });
  });

  describe('getPendingUserSelector', () => {
    it('should return pending user', () => {
      let result;
      store.pipe(select(fromSelectors.getPendingUserSelector)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(initialState.pendingUser);
    });
  });

  describe('getUsersOrganisationIdSelector', () => {
    it('should return organisation Id', () => {
      let result;
      store.pipe(select(fromSelectors.getUsersOrganisationIdSelector)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(initialState.organisationId);
    });
  });

  describe('getInviteUserErrorMessageSelector', () => {
    it('should return errorMessages', () => {
      let result;
      store.pipe(select(fromSelectors.getInviteUserErrorMessageSelector)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(initialState.errorMessages);
    });
  });

  describe('getInviteUserIsFormValidSelector', () => {
    it('should return isFormValid', () => {
      let result;
      store.pipe(select(fromSelectors.getInviteUserIsFormValidSelector)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(initialState.isFormValid);
    });
  });

  describe('getInviteUserErrorHeaderSelector', () => {
    it('should return error Header', () => {
      let result;
      store.pipe(select(fromSelectors.getInviteUserErrorHeaderSelector)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual(initialState.errorHeader);
    });
  });
});
