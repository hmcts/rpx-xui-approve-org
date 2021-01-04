import { generatePOSTAPIRequest } from './utils';
const should = require('chai').should();

suite('Approve Org -> PUT Update PBA numbers', function() {
  this.timeout(50000);
  const payload = {
  paymentAccounts: ['PBA8434341', 'PBA8535141'],
    orgId: 'SKA5D2Q'
  };
  test('PUT Update PBA numbers', () => generatePOSTAPIRequest ('PUT', '/api/updatePba', payload)
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
           response.status.should.be.eql(200);
           console.log(response);
        }));
});
