import { User } from '@hmcts/rpx-xui-common-lib';
import { Organisation, OrganisationAddress, OrganisationUser, OrganisationVM } from '../../org-manager/models/organisation';
import { AppUtils } from './app-utils';

describe('AppUtils', () => {
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
      pendingPaymentAccount: [{}],
      contactInformation: orgAddress,
      dateReceived: '01/01/2023',
      dateApproved: '12/01/2023'
    }];
    const organisationVM = AppUtils.mapOrganisations(organisations);
    expect(organisationVM[0].adminEmail).toEqual(organisations[0].superUser.email);
    expect(organisationVM[0].admin).toEqual(`${organisations[0].superUser.firstName} ${organisations[0].superUser.lastName}`);
    expect(organisationVM[0].dxNumber[0].dxNumber).toEqual(organisations[0].contactInformation[0].dxAddress[0].dxNumber);
    expect(organisationVM[0].dateReceived).toEqual(organisations[0].dateReceived);
    expect(organisationVM[0].dateApproved).toEqual(organisations[0].dateApproved);
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
      postCode: 'postcode',
      firstName: 'Test',
      lastName: 'User'
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
    const userDetails = AppUtils.mapUsers(mockUser);
    expect(AppUtils.mapUsers(mockUser)).toEqual(mockUserResult);
    expect(userDetails[0].email).toEqual(mockUser[0].email);
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

  it('user with roles in order', () => {
    const navItem1 = {
      text: 'text1',
      href: 'href1',
      active: false,
      feature: {
        isfeatureToggleable: true,
        featureName: 'feature1'
      },
      orderId: 1
    };
    const navItem2 = {
      text: 'text2',
      href: 'href2',
      active: false,
      feature: {
        isfeatureToggleable: true,
        featureName: 'feature2'
      },
      orderId: 2
    };
    const navItem3 = {
      text: 'text3',
      href: 'href3',
      active: false,
      feature: {
        isfeatureToggleable: true,
        featureName: 'feature3'
      },
      orderId: 3
    };
    const roleBasedNav = {
      role1: navItem1,
      role2: navItem2,
      role3: navItem3
    };
    const userRoles = ['role1', 'role2', 'role3'];
    const navItems = AppUtils.getNavItemsBasedOnRole(roleBasedNav, userRoles);
    expect(navItems).toEqual([navItem1, navItem2, navItem3]);
    expect(navItems[0].orderId).toEqual(1);
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
    const roles = AppUtils.getRoles('j%3A%5B%22prd-admin%22%2C%22prd-aac-system%22%2C%22xui-approver-userdata%22%2C%22cwd-admin%22%5D');
    expect(roles).toEqual(['prd-admin', 'prd-aac-system', 'xui-approver-userdata', 'cwd-admin']);
  });

  it('user with no roles', () => {
    const roles = AppUtils.getRoles('j%3A%5B%5D');
    expect(roles).toEqual([]);
  });

  it('user with just one role', () => {
    const roles = AppUtils.getRoles('j%3A%5B%22prd-admin%22%5D');
    expect(roles).toEqual(['prd-admin']);
  });

  it('user with no roles', () => {
    const roles = AppUtils.getRoles('');
    expect(roles).toEqual([]);
  });

  it('incorrect format roles', () => {
    const roles = AppUtils.getRoles('j%3A%5B%22prd-admin%22%5D%3A%5B%22test%22%5D');
    expect(roles).toEqual([]);
  });
});
