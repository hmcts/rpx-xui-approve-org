import { generatePOSTAPIRequest } from './utils';
const should = require('chai').should();

suite('API/CASES3 -> POST Invite User', function() {
  this.timeout(50000);
  const payload = {
    firstName: 'Vamshi',
    lastName: 'Muniganti',
    email: 'vam.mun7362@mailnesia.com',
    roles: ['pui-organisation-manager'],
    resendInvite: true
  };
  test('POST Invite User', () => generatePOSTAPIRequest ('POST', 'api/reinviteUser?organisationId=2GIHJH9', payload)
     // console.log('response', response.headers.get('cache-control'))
        .then(response => {
           response.status.should.be.eql(200);
           console.log(response);
        }));
});
