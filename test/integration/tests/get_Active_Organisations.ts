import {generateAPIRequest, timeout} from './utils';
const should = require('chai').should();

suite('\'Approve Org -> Get Active Organisation details\'', function() {
  this.timeout(timeout);
  test('GET Active Organisation details', () => generateAPIRequest ('GET', '/api/organisations?status=ACTIVE')
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
          response.status.should.be.eql(200);
        }));
});
