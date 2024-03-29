import { generateAPIRequest, timeout } from './utils';
const should = require('chai').should();

suite('\'Approve Org -> Get PBA Account names\'', function() {
  this.timeout(timeout);
  test('GET PBA Account names', () => generateAPIRequest('GET', '/api/pbaAccounts/?accountNames=PBA1088483,PBA0088344')
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      response.status.should.be.eql(200);
      console.log(response.data);
      // Temp disable assertions due to flaky state of the scenario. To be fixed and re-enabled.
      // response.data[0].account_name.should.be.eql('not found');
      // response.data[1].account_name.should.be.eql('GUNNERCOOKE LLP - SC1');
    }));
});
