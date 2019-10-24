import { OrganisationVM } from 'src/org-manager/models/organisation';
import * as fromSingleOrg from './single-org.actions';

describe('Single organisation actions', () => {
  describe('LoadSingleOrganisation actions GROUP', () => {
    // Init state
    describe('LoadSingleOrg', () => {
      it('should create an action', () => {
        const payload = 'A123';
        const action = new fromSingleOrg.LoadSingleOrg('A123');
        expect({ ...action }).toEqual({
          type: fromSingleOrg.LOAD_SINGLE_ORG,
          payload
        });
      });
    });

    // Success
    describe('LoadSingleOrganisationSuccess', () => {
        it('should create an action', () => {
          const payload: OrganisationVM = {
             pbaNumber: ['SU2DSCSA'],
             status: 'ACTIVE',
             name: 'Speake Limited',
             addressLine1: '72 Guild Street, London, SE23 6FH',
             addressLine2: '',
             townCity: '',
             county: '',
             dxNumber: ['12345567'],
             admin: 'Matt Speake',
             adminEmail: 'Matt@ape.com',
             view: '',
             sraId: '',
             organisationId: '1234567'
           };
          const action = new fromSingleOrg.LoadSingleOrgSuccess(payload);
          expect({ ...action }).toEqual({
            type: fromSingleOrg.LOAD_SINGLE_ORG_SUCCESS,
            payload
          });
        });
      });

          // Fail
    describe('LoadSingleOrganisationFail', () => {
      it('should create an action', () => {
        // Action is not been used. Should be passing error handler or error friendly string.
        const action = new fromSingleOrg.LoadSingleOrgFail('Something');
        const payload = 'Something';
        expect({ ...action }).toEqual({
          type: fromSingleOrg.LOAD_SINGLE_ORG_FAIL,
          payload
        });
      });
    });
});
});
