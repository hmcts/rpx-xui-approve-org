import { initialState, reducer } from './org-pending.reducer';
import { LoadPendingOrganisationsSuccess } from '../actions';
import { PendingOrganisation, PendingOrganisationSummary } from 'src/org-pending/models/pending-organisation';
import * as fromPendingOrganisation from './org-pending.reducer';

describe('PendingOrganisationsReducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;
      const state = reducer(undefined, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('LOAD_PENDING_ORGANISATION_SUCCESS action', () => {
    it('should update the state.pendingOrganisations', () => {
      const PendingOrganisationsMock: PendingOrganisation[] =
        [{
          name: 'Glen Byrne',
          organisationId: 'Byrne Limited',
          address: '13 Berryfield drive, Finglas',
          pbaNumber: '101010',
          admin: 'Glen Byrne',
          status: 'PENDING',
          view: 'View',
          id: '2424242',
          email: 'glen@byrne.com'
        }];

      const PendingOrganisationsMockSummary: PendingOrganisationSummary[] = [
        {
          name: 'Glen Byrne',
          organisationId: 'Byrne Limited',
          address: '13 Berryfield drive, Finglas',
          pbaNumber: '101010',
          admin: 'Glen Byrne',
          status: 'PENDING',
          view: 'View',
          id: '2424242',
          email: 'glen@byrne.com',
          routerLink: '/pending-organisations/pending-organisation/101010/'
        }
      ];

      const action = new LoadPendingOrganisationsSuccess(PendingOrganisationsMock);
      const state = reducer(initialState, action);
      expect(state.pendingOrganisations).toEqual(PendingOrganisationsMockSummary);
    });

    describe('getPendingOrganisations export', () => {
      it('should return state.pendingOrganisations', () => {
        expect(fromPendingOrganisation.getPendingOrganisations(initialState)).toEqual(null);
        expect();
      });

      describe('getPendingOrganisationsLoading export', () => {
        it('should return state.loading', () => {
          expect(fromPendingOrganisation.getPendingOrganisationsLoading(initialState)).toEqual(false);
        });
      });

      describe('getPendingOrganisationsLoaded export', () => {
        it('should return state.loaded', () => {
          expect(fromPendingOrganisation.getPendingOrganisationsLoaded(initialState)).toEqual(false);
        });
      });
    });
  });
});
