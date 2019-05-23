import * as fromSingleOrgPending from './single-org-pending.actions';
import { SingleOrgSummary } from 'src/org-manager/models/single-org-summary';
import {PendingOrganisation} from 'src/org-pending/models/pending-organisation'

/*describe('Single pending organisation actions', () => {
  describe('LoadSinglePendingOrganisation actions GROUP', () => {
    // Init state
    describe('LoadSingleOrg', () => {
      it('should create an action', () => {
        const payload = [{payload:'1', type: '2'}]
        const action = new fromSingleOrgPending.LoadSingleOrg(payload);
        expect({ ...action }).toEqual({
          type: fromSingleOrgPending.LoadSingleOrg,
          payload
        });
      });
    });
});
});*/

    // Success
   /* describe('LoadSingleOrganisationSuccess', () => {
        it('should create an action', () => {
          const payload:any[] =  
          [{ 'payload': [
            {'pbaNumber': 'SU2DSCSA',
            'status': 'ACTIVE',
            'effective_date': '22/10/2022',
            'dx_exchange': '7654321',
            'name': 'Speake Limited',
            'address': '72 Guild Street, London, SE23 6FH',
            'dxNumber': '12345567',
            'dxExchange': '7654321',
            'admin': 'Matt Speake'}

          ]
 
          }]
          const action = new fromSingleOrgPending.LoadSingleOrgSuccess(payload[0]);
          console.log('action is',action)
          console.log('type is',action.type)
          console.log('payload is',action.payload)
          expect({ ...action }).toEqual({
            type: '[Single Pending Organisation] Load Single Pending Organisations Success',
            payload
          });
        });
      });

*/