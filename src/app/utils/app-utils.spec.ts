import {AppUtils} from './app-utils';
import { Organisation, OrganisationVM, OrganisationAddress, OrganisationUser } from 'src/org-manager/models/organisation';
import { User } from '@hmcts/rpx-xui-common-lib';

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
      postCode: 'org.postCode',
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
      sraId: null,
      postCode: 'postcode'
    }];
    const organisations = AppUtils.mapOrganisationsVm(organisationVM);
    expect(organisations[0].organisationIdentifier).toEqual(organisationVM[0].organisationId);
    expect(organisations[0].name).toEqual(organisationVM[0].name);
  });

  it('should string capitalised', () => {
    const randomString = 'RANDOMSTRING';
    expect(AppUtils.capitalizeString(randomString)).toEqual('Randomstring');
  });

  it('should string mapUser', () => {
    const mockUser: OrganisationUser[] = [{
      userIdentifier: 'id',
      firstName: 'hello',
      lastName: 'world',
      email: 'test@test.com',
      idamStatus: 'PENDING',
      idamStatusCode: 'code',
      idamMessage: 'message',
      roles: ['pui-case-manager', 'pui-user-manager']
    }];

    const mockUserResult: User[] = [{
      fullName: 'hello world',
      firstName: 'hello',
      lastName: 'world',
      email: 'test@test.com',
      status: 'Pending',
      resendInvite: true,
      ['manageCases']: 'Yes',
      ['manageUsers']: 'Yes',
      ['manageOrganisations']: 'No'

    }];
    expect(AppUtils.mapUsers(mockUser)).toEqual(mockUserResult);
  });

  it('should return 500 error org url', () => {
    expect(AppUtils.get500Error('dummy').errors[1].url).toEqual('/organisation-details/dummy');
  });

  it('should return 400 error org url', () => {
    expect(AppUtils.get400Error('dummy').errors[0].url).toEqual('/organisation-details/dummy');
  });

  it('should return 404 error org url', () => {
    expect(AppUtils.get404Error('dummy').errors[1].url).toEqual('/organisation-details/dummy');
  });
 });

describe('getNavItemsBasedOnRole', () => {
  it('user with role1', () => {
    const navItem = {
        text: 'text1',
        href: 'href1',
        active: false,
        feature: {
          isfeatureToggleable: true,
          featureName: 'feature1'
        },
        orderId: 0
    };
    const roleBasedNav = {
          role1: navItem
    };
    const userRoles = ['role1', 'role2', 'role3'];
    const navItems = AppUtils.getNavItemsBasedOnRole(roleBasedNav, userRoles);
    expect(navItems).toEqual([navItem]);
   });

  it('user with no roles', () => {
    const navItem = {
        text: 'text1',
        href: 'href1',
        active: false,
        feature: {
          isfeatureToggleable: true,
          featureName: 'feature1'
        },
        orderId: 0
    };
    const roleBasedNav = {
        role4: navItem
    };
    const userRoles = ['role1', 'role2', 'role3'];
    const navItems = AppUtils.getNavItemsBasedOnRole(roleBasedNav, userRoles);
    expect(navItems).toEqual([]);
  });
});

describe('getRoles', () => {
  it('user with roles', () => {
      const roles = AppUtils.getRoles('j%3A%5B%22prd-admin%22%2C%22prd-aac-system%22%2C%22xui-approver-userdata%22%2C%22pui-caa%22%5D');
      expect(roles).toEqual(['prd-admin', 'prd-aac-system', 'xui-approver-userdata', 'pui-caa']);
    });
  it('user with no roles', () => {
    const roles = AppUtils.getRoles('j%3A%5B%5D');
    expect(roles).toEqual([]);
  });
  it('user with just one role', () => {
    const roles = AppUtils.getRoles('j%3A%5B%22prd-admin%22%5D');
    expect(roles).toEqual(['prd-admin']);
  });
});
