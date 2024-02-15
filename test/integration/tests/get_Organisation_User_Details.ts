import { generateAPIRequest, timeout } from './utils';
const should = require('chai').should();

suite('Approve Org -> Get Organisation Users details', function() {
  this.timeout(timeout);
  test('GET Organisation User details', () => generateAPIRequest('GET', '/api/allUserListWithoutRoles?usersOrgId=2GIHJH9')
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      response.status.should.be.eql(200);
      console.log(response.data.users[0].email);
      response.data.users[0].firstName.should.be.eql('Jason');
      response.data.users[0].lastName.should.be.eql('Lee');
      response.data.users[0].idamStatus.should.be.eql('ACTIVE');
    }));
});
