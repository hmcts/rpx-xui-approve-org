import { expect } from 'chai';
import { idamGetUserDetails } from '../../../pactUtil';
import { PactTestSetup } from '../settings/provider.mock';

const { MatchersV2: Matchers } = require('@pact-foundation/pact');
const { somethingLike } = Matchers;
const pactSetUp = new PactTestSetup({ provider: 'idamApi_users', port: 8000 });

describe('Idam API user details', () => {
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  const RESPONSE_BODY = {
    'id': somethingLike('abc123'),
    'forename': somethingLike('Joe'),
    'surname': somethingLike('Bloggs'),
    'email': somethingLike('joe.bloggs@hmcts.net'),
    'active': somethingLike(true),
    'roles': somethingLike([
      somethingLike('solicitor'), somethingLike('caseworker')
    ])
  };

  describe('Get user details from Idam', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'a valid user exists',
        uponReceiving: 'a request for that user',
        withRequest: {
          method: 'GET',
          path: '/details',
          headers: {
            Authorization: 'Bearer some-access-token'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: RESPONSE_BODY
        }
      };
      // @ts-ignore
      await pactSetUp.provider.addInteraction(interaction);
    });

    afterEach(async () => {
      await pactSetUp.provider.verify();
    });

    after(async () => {
      await pactSetUp.provider.finalize();
    });

    it('Returns the user details from IDAM', async () => {
      const taskUrl = `${pactSetUp.provider.mockService.baseUrl}/details`;
      const axiosResponse = await idamGetUserDetails(taskUrl);
      const dto: IdamGetDetailsResponseDto = axiosResponse.data as IdamGetDetailsResponseDto;
      assertResponses(dto);
    });
  });
});

function assertResponses(dto: IdamGetDetailsResponseDto) {
  expect(dto.active).to.be.equal(true);
  expect(dto.email).to.be.equal('joe.bloggs@hmcts.net');
  expect(dto.forename).to.be.equal('Joe');
  expect(dto.surname).to.be.equal('Bloggs');
  expect(dto.roles[0]).to.be.equal('solicitor');
  expect(dto.roles[1]).to.be.equal('caseworker');
}

export interface IdamGetDetailsResponseDto {
  id: string,
  forename: string,
  surname: string,
  email: string,
  active: boolean
  roles: string[]
}
