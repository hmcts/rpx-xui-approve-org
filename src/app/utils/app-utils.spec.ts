import {AppUtils} from './app-utils';
import { Organisation, OrganisationVM, OrganisationAddress } from 'src/org-manager/models/organisation';
import { AppConstants } from '../app.constants';

describe('AppUtils', () => {

  it('should set correct page titles pending details', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/organisation/');
    expect(array).toEqual('Pending organisation details - Approve organisation');
  });
  it('should set correct page titles confirmation', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/approve');
    expect(array).toEqual('Check details - Approve organisations');
  });
  it('should set correct page titles check details', () => {
    const array = AppUtils.setPageTitle('/pending-organisations/approve-success');
    expect(array).toEqual('Confirmation - Approve organisations');
  });
  it('should set correct page titles pending ', () => {
    const array = AppUtils.setPageTitle('/pending-organisations');
    expect(array).toEqual('Pending organisations - Approve organisations');
  });
  it('should set correct page titles active details', () => {
    const array = AppUtils.setPageTitle('/organisations/organisation');
    expect(array).toEqual('Check details - Approve organisations');
  });
  it('should set correct page titles active details', () => {
    const array = AppUtils.setPageTitle('/organisations/organisation/');
    expect(array).toEqual('Active organisation details - Approve organisations');
  });
  it('should set correct page titles general fallback', () => {
    const array = AppUtils.setPageTitle('');
    expect(array).toEqual('Active organisations - Approve organisations');
  });
  it('should map organisation', () => {
    const orgAddress: [OrganisationAddress] = [{
      addressLine1: 'Line1',
      addressLine2: 'Some Address1',
      townCity: 'London',
      county: 'Middlesex',
      dxAddress: [
          {
              dxNumber: '1111111111111',
              dxExchange: 'DX Exchange 1'
          }
              ]
      }
    ];
    const organisations: [Organisation] = [{
      organisationIdentifier: '9VR9JLM',
      name: 'Vamshi Orgg',
      status: 'PENDING',
      sraId: 'SRA1234560123',
      superUser: {
          userIdentifier: '1fab0a19-e83a-436e-8ceb-e43ab487c6ed',
          firstName: 'Vam',
          lastName: 'Shi',
          email: 'vam@ff.com'
      },
      paymentAccount: [{}],
      contactInformation: orgAddress
  }];
    const organisationVM = AppUtils.mapOrganisations(organisations);
    expect(organisationVM[0].organisationId).toEqual(organisations[0].organisationIdentifier);
    expect(organisationVM[0].name).toEqual(organisations[0].name);
  });
  it('should map organisation VM', () => {
    const organisationVM: [OrganisationVM] = [{
      organisationId: 'Id',
      status: 'ACTIVE',
      admin: 'ADMIN',
      adminEmail: 'aa@eemail.com',
      addressLine1: 'some address',
      addressLine2: '',
      townCity: 'Lon',
      county: '',
      name: 'Full Name',
      view: 'View',
      pbaNumber: [{}],
      dxNumber: [{}],
      sraId: null
    }];
    const organisations = AppUtils.mapOrganisationsVm(organisationVM);
    expect(organisations[0].organisationIdentifier).toEqual(organisationVM[0].organisationId);
    expect(organisations[0].name).toEqual(organisationVM[0].name);
  });
  // it('should return aat environment string', () => {
  //   let nav = 'http://localhost';
  //   let url = AppUtils.getEnvironment(nav);
  //   expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.aat);
  //
  //   nav = 'http://aat/something';
  //   url = AppUtils.getEnvironment(nav);
  //   expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.aat);
  // });

  it('should return demo or ithc  or perf-test environment string', () => {
    let nav = 'http://demo/something';
    let url = AppUtils.getEnvironment(nav);
    expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.demo);

    nav = 'http://ithc/something';
    url = AppUtils.getEnvironment(nav);
    expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.ithc);

    nav = 'http://perftest/something';
    url = AppUtils.getEnvironment(nav);
    expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.perftest);
  });

  it('should return prod as it does not match any', () => {
    const nav = 'http://notany/something';
    const url = AppUtils.getEnvironment(nav);
    expect(url).toEqual(AppConstants.ENVIRONMENT_NAMES.prod);
  });
 });
