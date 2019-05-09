import * as fromOrganisation from './organisation.actions';

describe('OrganisationActions actions', () => {
  describe('LoadOrganisations actions GROUP', () => {
    // Init state
    describe('LoadOrganisation', () => {
      it('should create an action', () => {
        const action = new fromOrganisation.LoadOrganisation();
        expect({ ...action }).toEqual({
          type: fromOrganisation.LOAD_ORGANISATIONS,
        });
      });
    });
      // Success
      describe('LoadOrganisagionSuccess', () => {
        it('should create an action', () => {
          const payload = [{payload: 'something', pageId: 'someString'}];
          const action = new fromOrganisation.LoadOrganisationSuccess([{payload: 'something', pageId: 'someString'}]);
          expect({ ...action }).toEqual({
            type: fromOrganisation.LOAD_ORGANISATIONS_SUCCESS,
            payload
          });
        });
      });
      // Fail
      describe('LoadOrganisationFail', () => {
        it('should create an action', () => {
          const action = new fromOrganisation.LoadOrganisationFail('Something');
          const payload = 'Something';
          expect({ ...action }).toEqual({
            type: fromOrganisation.LOAD_ORGANISATIONS_FAIL,
            payload
          });
        });
      });
    });
  });