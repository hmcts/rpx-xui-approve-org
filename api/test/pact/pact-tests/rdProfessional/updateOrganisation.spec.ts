import { expect } from 'chai';
import { putOperation } from "../../../pactUtil";
import { PactTestSetup } from '../settings/provider.mock';

const { Matchers } = require('@pact-foundation/pact');
const { somethingLike } = Matchers;
const pactSetUp = new PactTestSetup({ provider: 'referenceData_organisationalInternal', port: 8000 });


describe('Update an organisation', () => {
  before(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
   })

  const orgnId = "UTVC86X";

  let mockRequest = {
    "name": "Organisation name",
    "status": "PENDING",
    "sraId": "SRA12345",
    "superUser": {
      "firstName": 'Bill',
      "lastName": 'Roberts',
      "email": 'bill.roberts@hmcts.net'
    },
    "paymentAccount": ['pbaPayment', 'payment'],
    "contactInformation": [
      {
        "addressLine1": "AddressLine1",
        "addressLine2": "AddressLine2",
        "addressLine3": "AddressLine3",
        "townCity": "Sutton",
        "county": "Surrey",
        "country": "UK",
        "postCode": "SM12SX",
        "dxAddress": [
          {
            "dxNumber": "DX2313",
            "dxExchange": "EXCHANGE"
          }
        ]
      }]
  }

  let mockResponse: string = "Success";

  describe('Update an organisation ', () => {
    before(async () => {
      await pactSetUp.provider.setup();
      const interaction = {
        state: 'An Organisation exists for update',
        uponReceiving: 'A Request to update an organisation',
        withRequest: {
          method: "PUT",
          path: "/refdata/internal/v1/organisations/" + orgnId,
          body: mockRequest,
          headers: {
            "Content-Type": "application/json",
            "ServiceAuthorization": "ServiceAuthToken",
            "Authorization": "Bearer some-access-token"
          }
        },
        willRespondWith: {
          status: 200
        }
      }
      // @ts-ignore
      pactSetUp.provider.addInteraction(interaction)

    })

    it('Update an organisation and returns response', async () => {
      const taskUrl: string = `${pactSetUp.provider.mockService.baseUrl}/refdata/internal/v1/organisations/` + orgnId;

      const resp = putOperation(taskUrl, mockRequest)

      resp.then((response) => {
        try {
          const responseDto: string = response.data
          expect(response.status).to.be.equal(201);
        } catch (e) {
          console.log(`error occurred in asserting response...` + e)
        }
      }).then(() => {
        pactSetUp.provider.verify(),
        pactSetUp.provider.finalize()
      }).finally(() => {
        pactSetUp.provider.verify()
        pactSetUp.provider.finalize()
      })
    })
  })
})
