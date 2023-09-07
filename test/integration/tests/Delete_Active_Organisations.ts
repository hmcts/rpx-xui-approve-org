import { generateAPIRequest, timeout } from './utils';
import { generatePOSTAPIRequest } from './utils';
const should = require('chai').should();
let org = '';

suite('Approve Org -> Get Active Organisation details', function() {
  this.timeout(timeout);
  test('GET Pending Organisations details', () => generateAPIRequest('GET', '/api/organisations?status=ACTIVE')
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      response.status.should.be.eql(200);
      org = response.data[0].organisationIdentifier;
      console.log(`Active Org: ${org}`);
    }));
  test('Approve Org -> Delete Active Organisation', () => generatePOSTAPIRequest('DELETE', `/api/organisations/${org}`, {})
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      response.status.should.be.eql(200);
    }));
});
