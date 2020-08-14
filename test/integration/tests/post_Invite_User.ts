import {mocha} from './test';
import {http} from './utils';

suite('API/CASES3 -> POST Invite User', () => {
  mocha.timeout(50000);
  const payload = {
    firstName: 'Vamshi',
    lastName: 'Muniganti',
    email: `vam.mun${Math.round(Math.random() * 10000)}@mailnesia.com`,
    roles: [
    'pui-user-manager'
  ],
    jurisdictions: [
    {
      id: 'Probate'
    }
  ],
    resendInvite: false
  };
  test('POST Invite User', async () => {
    try {
      const response = await http.post('/refdata/external/v1/organisations/users/', payload);
      // @ts-ignore
      response.status.should.be.eql(201);
    } catch (error) {
      console.log(error);
    }
  });
});
