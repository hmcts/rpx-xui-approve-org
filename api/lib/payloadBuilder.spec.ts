import { expect } from 'chai';
import 'mocha';
import { makeOrganisationPayload } from './payloadBuilder';

describe('Payload builder', () => {
  const STATE_VALUES = {
    haveDXNumber: 'nextUrl',
    orgName: 'organisation name field value',
    createButton: 'Continue',
    officeAddressOne: 'building and street field 1',
    officeAddressTwo: 'building and street field 2',
    townOrCity: 'town field',
    county: 'county field',
    postcode: 'RG24 9AB',
    PBAnumber1: 'PBA number field 1',
    PBAnumber2: 'PBA number field 2',
    dontHaveDX: 'name',
    firstName: 'super user first name',
    lastName: 'super user last name',
    emailAddress: 'test.address@test.com',
    DXnumber: '12345 dx number field ',
    DXexchange: '12345 dx exchange field',
    sraNumber: 'SRA123456'
  };

  it('should map the organisation name', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);
    expect(organisationPayload.name).to.equal(STATE_VALUES.orgName);
  });

  it('should map the super user details', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);

    expect(organisationPayload.superUser.firstName).to.equal(STATE_VALUES.firstName);
    expect(organisationPayload.superUser.lastName).to.equal(STATE_VALUES.lastName);
    expect(organisationPayload.superUser.email).to.equal(STATE_VALUES.emailAddress);
  });

  it('should map the office address into contactInformation', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);
    const [contactInformation] = organisationPayload.contactInformation;

    expect(contactInformation.addressLine1).to.equal(STATE_VALUES.officeAddressOne);
    expect(contactInformation.addressLine2).to.equal(STATE_VALUES.officeAddressTwo);
    expect(contactInformation.county).to.equal(STATE_VALUES.county);
    expect(contactInformation.postCode).to.equal(STATE_VALUES.postcode);
    expect(contactInformation.townCity).to.equal(STATE_VALUES.townOrCity);
  });

  it('should map populated PBA numbers into paymentAccount', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);
    expect(organisationPayload.paymentAccount).to.deep.equal([
      STATE_VALUES.PBAnumber1,
      STATE_VALUES.PBAnumber2
    ]);
  });

  it('should omit blank PBA numbers', () => {
    const organisationPayload = makeOrganisationPayload({
      ...STATE_VALUES,
      PBAnumber1: '',
      PBAnumber2: 'PBA number field 2'
    });

    expect(organisationPayload.paymentAccount).to.deep.equal([
      STATE_VALUES.PBAnumber2
    ]);
  });

  it('should map DX details when present', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);
    expect(organisationPayload.contactInformation[0].dxAddress).to.deep.equal([{
      dxExchange: STATE_VALUES.DXexchange,
      dxNumber: STATE_VALUES.DXnumber
    }]);
  });

  it('should omit DX details when not supplied', () => {
    const organisationPayload = makeOrganisationPayload({
      ...STATE_VALUES,
      DXnumber: '',
      DXexchange: ''
    });

    expect(organisationPayload.contactInformation[0]).to.not.have.property('dxAddress');
  });

  it('should map the optional SRA id when present', () => {
    const organisationPayload = makeOrganisationPayload(STATE_VALUES);
    expect(organisationPayload.sraId).to.equal(STATE_VALUES.sraNumber);
  });
});
