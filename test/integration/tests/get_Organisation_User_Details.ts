import { generateAPIRequest } from './utils';
const should = require('chai').should()

suite('Approve Org -> Get Organisation Users details', function() {
  this.timeout(50000);
  test('GET Organisation User details', () => generateAPIRequest ('GET', 'api/organisations?usersOrgId=2GIHJH9')
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
           response.status.should.be.eql(200);
           console.log(response.data.users[0].email);
           response.data.users[0].firstName.should.be.eql('Vamshi');
           response.data.users[0].lastName.should.be.eql('Muniganti');
           response.data.users[0].idamStatus.should.be.eql('PENDING');
        }));
});
