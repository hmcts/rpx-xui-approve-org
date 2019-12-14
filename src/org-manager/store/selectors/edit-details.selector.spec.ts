import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import * as fromSelectors from './edit-details.selectors';
import { reducers } from '../index';
import {initialState, EditDetailsState} from '../reducers/edit-details.reducer';

describe('Edit Details selectors', () => {
  let store: Store<EditDetailsState>;
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

  describe('getEditDetailsState', () => {
    it('should return initial state', () => {
      let result;
      store.pipe(select(fromSelectors.getEditDetailsState)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(initialState);
    });
  });

  describe('getPbaFromErrors', () => {
    it('should return error messages', () => {
      let result;
      store.pipe(select(fromSelectors.getPbaFromErrors)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(initialState.pba.errorMessages);
    });
  });

  describe('getServerErrors', () => {
    it('should return server error messages', () => {
      let result;
      store.pipe(select(fromSelectors.getServerErrors)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(initialState.pba.serverError);
    });
  });

  describe('getIsFormValid', () => {
    it('should return is form valid boolen', () => {
      let result;
      store.pipe(select(fromSelectors.getIsFormValid)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual(initialState.pba.isFormValid);
    });
  });

  describe('getPbaHeaderErrors', () => {
    it('should return errors headers', () => {
      let result;
      store.pipe(select(fromSelectors.getPbaHeaderErrors)).subscribe(value => {
        result = value;

      });
      expect(result).toEqual({items: [], isFormValid: true});
    });
  });

});
