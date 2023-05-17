import { generateAPIRequest, timeout } from './utils';
import { generatePOSTAPIRequest } from './utils';
const should = require('chai').should();
let org = '';
let body = '';
suite('Approve Org -> Get Pending Organisation details', function() {
  this.timeout(timeout);
  test('GET Pending Organisations details', () => generateAPIRequest('GET', '/api/organisations?status=PENDING')
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      response.status.should.be.eql(200);
      // response.add = {jurisdictions: [ {id : 'SSCS'}, {id: 'AUTOTEST1'}, {id: 'DIVORCE'}, {id: 'PROBATE'}]},
      org = response.data[0].organisationIdentifier;
      console.log(`Pending Org: ${org}`);
      response.data[0].status = 'ACTIVE';
      body = response.data[0];
      console.log(body);
    }));
  test('Approve Org -> Approve Pending Organisation', () => generatePOSTAPIRequest('PUT', `/api/organisations/${org}`, body));
  console.log(`Org is approved ${org}`);
});
