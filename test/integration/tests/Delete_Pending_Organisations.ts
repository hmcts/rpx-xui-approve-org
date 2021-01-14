import { generateAPIRequest } from './utils';
import { generatePOSTAPIRequest } from './utils';
const should = require('chai').should();
let org = '';

suite('Approve Org -> Get Pending Organisation details', function() {
  this.timeout(50000);
  test('GET Pending Organisations details', () => generateAPIRequest ('GET', '/api/organisations?status=PENDING')
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
          response.status.should.be.eql(200);
          org = response.data[0].organisationIdentifier;
          console.log (`Pending Org: ${org}`);
        }));
  test('Approve Org -> Delete Pending Organisation', () => generatePOSTAPIRequest ('DELETE', `/api/organisations/${org}`, {})
  // console.log('response', response.headers.get('cache-control'))
    .then(response => {
      response.status.should.be.eql(200);
    }));
});
