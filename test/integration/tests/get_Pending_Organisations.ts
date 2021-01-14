import { generateAPIRequest } from './utils';
const should = require('chai').should();

suite('Approve Org -> Get Pending Organisation details', function() {
  this.timeout(50000);
  test('GET Pending Organisations details', () => generateAPIRequest ('GET', '/api/organisations?status=PENDING')
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
          response.status.should.be.eql(200);
        }));
});
