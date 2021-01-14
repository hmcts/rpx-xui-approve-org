import {generatePOSTAPIRequest, timeout} from './utils';
const should = require('chai').should();

suite('Approve Org -> PUT Update PBA numbers', function() {
  this.timeout(timeout);
  const payload = {
  paymentAccounts: [`PBA1${Math.floor(100000 + Math.random() * 900000)}`, `PBA2${Math.floor(100000 + Math.random() * 900000)}`],
  orgId: 'BOHOBFK',
  };
  test('PUT Update PBA numbers', () => generatePOSTAPIRequest ('PUT', '/api/updatePba', payload));
 // console.log('PBAs updated');
});
