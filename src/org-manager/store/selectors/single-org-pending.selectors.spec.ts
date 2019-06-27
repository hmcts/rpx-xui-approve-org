import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { PendingSingleOrgState } from '../reducers/single-org-pending.reducer';
import { getSinglePendingOrgState } from './single-org-pending.selectors';
import { reducers } from '../index';

describe('Single organisation pending selectors', () => {
  let store: Store<PendingSingleOrgState>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature('organisations', reducers),
      ],
    });
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  describe('getSingleOrgPendingState', () => {
    it('should return single organisation pending state', () => {
      let result;

      store.pipe(select(getSinglePendingOrgState)).subscribe(value => {
        result = value;
      });
      expect(result).toEqual({ data: {}, loaded: false, loading: false });
    });
  });
});
