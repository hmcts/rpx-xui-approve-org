import {mocha} from './test';
import {http} from './utils';

suite('API/CASES -> Get Organisation details', () => {
  mocha.timeout(10000);
  test('GET Manage Organisation details', async () => {
    try {
      const response = await http.get('/refdata/external/v1/organisations');
      // @ts-ignore
      response.status.should.be.eql(200);
      response.data.organisationIdentifier.should.be.eql('2GIHJH9');
      response.data.name.should.be.eql('XUI-API-Test-Organisation');
      response.data.status.should.be.eql('ACTIVE');
      response.data.sraId.should.be.eql('SRA7800035677');
      response.data.sraRegulated.should.be.eql(false);
      response.data.paymentAccount[0].should.be.eql('PBA9845644');
      response.data.paymentAccount[1].should.be.eql('PBA8456443');
      response.data.contactInformation[0].addressLine1.should.be.eql('2');
      response.data.contactInformation[0].townCity.should.be.eql('Aldgate Street');
      response.data.contactInformation[0].county.should.be.eql('London');
      response.data.contactInformation[0].dxAddress[0].dxNumber.should.be.eql('DX8990022334');
      response.data.contactInformation[0].dxAddress[0].dxExchange.should.be.eql('DX London');
    } catch (error) {
      console.log(error);
    }
  });
});
