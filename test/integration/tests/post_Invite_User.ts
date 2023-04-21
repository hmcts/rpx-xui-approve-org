import { generatePOSTAPIRequest, timeout } from './utils';
const should = require('chai').should();

suite('Approve org -> POST Invite User', function() {
  this.timeout(timeout);

  const payload = {
    firstName: 'Vamshi',
    lastName: 'Muniganti',
    email: 'vam.mun1752@mailnesia.com',
    roles: ['pui-organisation-manager'],
    resendInvite: true
  };
  test('POST Invite User', () => generatePOSTAPIRequest('POST', '/api/reinviteUser?organisationId=2GIHJH9', payload)
  // console.log('response', response.headers.get('cache-control'))
    .then((response) => {
      if (response.status === 429) {
        console.log(`User Already Invited: ${response.status}`);
      }
      if (response.status === 200) {
        console.log(`User Re Invited: ${response.status}`);
      }
      if (response.status === 404) {
        throw new Error(`User doesn't exist: ${response.status}`);
      }
    }));
});
