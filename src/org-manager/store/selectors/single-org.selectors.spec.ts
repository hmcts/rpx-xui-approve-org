import { TestBed } from '@angular/core/testing';
import { select, Store, StoreModule } from '@ngrx/store';
import { SingleOrgState } from '../reducers/single-org.reducer';
import { getSingleOrgState } from './single-org.selectors';
import { reducers } from '../index';
import { LoadSingleOrgSuccess } from '../actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';

describe('Single organisation selectors', () => {
  let store: Store<SingleOrgState>;
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

  describe('getSingleOrgState', () => {
    it('should return single organisation state', () => {
      let result;

      store.pipe(select(getSingleOrgState)).subscribe(value => {
        result = value;

      });

      expect(result).toEqual({  data: {}, loaded: false, loading: false });
    });
  });

});
