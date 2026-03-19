import { OrganisationPayload } from '../interfaces/organisationPayload';

function setPropertyIfNotNull(organisationPayload: OrganisationPayload, propertyName: 'sraId', value?: string) {
  if (value) {
    organisationPayload[propertyName] = value;
  }
}

function setDXIfNotNull(contactInformation: OrganisationPayload['contactInformation'][number], dxNumber?: string, dxExchange?: string) {
  if (dxNumber || dxExchange) {
    contactInformation.dxAddress = [{
      dxNumber: dxNumber || '',
      dxExchange: dxExchange || ''
    }];
  }
}

export function makeOrganisationPayload(stateValues): OrganisationPayload {
  const organisationPayload: OrganisationPayload = {
    contactInformation: [{
      addressLine1: stateValues.officeAddressOne,
      addressLine2: stateValues.officeAddressTwo,
      county: stateValues.county,
      postCode: stateValues.postcode,
      townCity: stateValues.townOrCity
    }],
    name: stateValues.orgName,
    paymentAccount: [stateValues.PBAnumber1, stateValues.PBAnumber2].filter(Boolean),
    superUser: {
      email: stateValues.emailAddress,
      firstName: stateValues.firstName,
      lastName: stateValues.lastName
    }
  };

  setPropertyIfNotNull(organisationPayload, 'sraId', stateValues.sraNumber);
  setDXIfNotNull(organisationPayload.contactInformation[0], stateValues.DXnumber, stateValues.DXexchange);

  return organisationPayload;
}
