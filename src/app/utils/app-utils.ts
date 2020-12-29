import { User } from '@hmcts/rpx-xui-common-lib';
import { Organisation, OrganisationUser, OrganisationVM } from 'src/org-manager/models/organisation';
import { AppConstants } from '../app.constants';
import { NavItem, UserRoleNav } from '../store';
import { GlobalError } from '../store/reducers/app.reducer';

/**
 * Contains static stateless utility methods for the App
 *
 */
export class AppUtils {

  public static setPageTitle(url): string {
    /**
     * it sets correct page titles
     */
    switch (url) {
      case '/pending-organisations/organisation/': {
        return 'Pending organisation details - Approve organisation';
      }
      case '/pending-organisations/approve' : {
        return 'Check details - Approve organisations';
      }
      case '/pending-organisations/approve-success' : {
        return 'Confirmation - Approve organisations';
      }
      case '/pending-organisations': {
        return 'Pending organisations - Approve organisations';
      }
      case '/organisations/organisation': {
        return 'Check details - Approve organisations';
      }
    }
    // need to use undex of becaue id the id that is passed on the end.
    if (url.indexOf('/organisations/organisation/') !== -1) {
      return 'Active organisation details - Approve organisations';
    }
    // default return
    return 'Active organisations - Approve organisations';

  }

  public static mapOrganisations(obj: Organisation[]): OrganisationVM[] {
    const organisationModel: OrganisationVM[] = [];
    obj.forEach((apiOrg) => {
      organisationModel.push(this.mapOrganisation(apiOrg));
    });

    return organisationModel;
  }

  public static mapOrganisation(apiOrg: Organisation): OrganisationVM {
    const organisationVm = new OrganisationVM();
    organisationVm.name = apiOrg.name;
    organisationVm.adminEmail = apiOrg.superUser.email;
    organisationVm.pbaNumber = apiOrg.paymentAccount;
    organisationVm.organisationId = apiOrg.organisationIdentifier;
    organisationVm.view = 'View';
    organisationVm.status = apiOrg.status;
    organisationVm.admin = `${apiOrg.superUser.firstName} ${apiOrg.superUser.lastName}`;
    if (apiOrg.contactInformation && apiOrg.contactInformation[0]) {
      organisationVm.dxNumber = apiOrg.contactInformation[0].dxAddress;
      organisationVm.addressLine1 = apiOrg.contactInformation[0].addressLine1;
      organisationVm.addressLine2 = apiOrg.contactInformation[0].addressLine2;
      organisationVm.postCode = apiOrg.contactInformation[0].postCode;
      organisationVm.townCity = apiOrg.contactInformation[0].townCity;
      organisationVm.county = apiOrg.contactInformation[0].county;
    }
    organisationVm.sraId = apiOrg.sraId;
    return organisationVm;
  }

  public static mapOrganisationsVm(obj: OrganisationVM[]): Organisation[] {
    const organisations: Organisation[] = [];
    obj.forEach((org) => {
      const organisation: Organisation = {
        organisationIdentifier: org.organisationId,
        sraId: org.sraId,
        contactInformation: [{
          addressLine1: org.addressLine1,
          addressLine2: org.addressLine2,
          townCity: org.townCity,
          county: org.county,
          dxAddress: org.dxNumber
          }],
        superUser: {
          userIdentifier: org.admin,
          firstName: org.admin,
          lastName: org.admin,
          email: org.adminEmail
        },
        status: 'ACTIVE',
        name: org.name,
        paymentAccount: org.pbaNumber
      };
      organisations.push(organisation);
    });

    return organisations;
  }

  public static capitalizeString(stringToCapitalize: string) {
    const stringLowercase = stringToCapitalize.toLowerCase();
    const stringCapitalised = stringLowercase.charAt(0).toUpperCase() + stringLowercase.slice(1);
    return stringCapitalised;
  }

  public static mapUsers(obj: OrganisationUser[]): User[] {
    const users: User[] = [];
    if (obj) {
      obj.forEach((user) => {
        const newUser: User = {};
        newUser.firstName = user.firstName;
        newUser.lastName = user.lastName;
        newUser.fullName = `${user.firstName} ${user.lastName}`;
        newUser.email = user.email;
        AppConstants.USER_ROLES.forEach((userRoles) => {
          if (user.roles) {
            newUser[userRoles.roleType] = user.roles.includes(userRoles.role) ? 'Yes' : 'No';
          }
        });
        newUser.status = AppUtils.capitalizeString(user.idamStatus);
        newUser.resendInvite = user.idamStatus === 'PENDING';
        users.push(newUser);
      });
    }
    return users;
  }


  public static get500Error(orgId: string): GlobalError {
    const errorMessages = [{
      bodyText: 'Try again later.',
      urlText: null,
      url: null
    },
    {
      bodyText: null,
      urlText: 'Go back to manage users',
      url: `/organisation-details/${orgId}`
    }];

    const globalError = {
      header: 'Sorry, there is a problem with the service',
      errors: errorMessages
    };
    return globalError;
  }

  public static get400Error(orgId: string): GlobalError {
    const errorMessage = {
      bodyText: 'to check the status of the user',
      urlText: 'Refresh and go back',
      url: `/organisation-details/${orgId}`
    };
    const globalError = {
      header: 'Sorry, there is a problem',
      errors: [errorMessage]
    };
    return globalError;
  }

  public static get404Error(orgId: string): GlobalError {
    const errorMessages = [{
      bodyText: 'Contact Support teams to reactivate this account',
      urlText: null,
      url: null
    },
    {
      bodyText: null,
      urlText: 'Go back to manage users',
      url: `/organisation-details/${orgId}`
    }];

    const globalError = {
      header: 'Sorry, there is a problem with this account',
      errors: errorMessages
    };
    return globalError;
  }

  // Util methos to return Navitems 
  // based on user's role
  public static getNavItemsBasedOnRole(roleBasedNav: UserRoleNav, userRoles: string[]): NavItem[] {
    let roleNavItems: NavItem [] = new Array<NavItem>();
    userRoles.forEach(role => {
      if(roleBasedNav.hasOwnProperty(role)) {
        roleNavItems = [...roleNavItems, roleBasedNav[role]];
      }
    });
    return roleNavItems.sort((a, b) => (a.orderId > b.orderId) ? 1 : -1)
  }

  // Helper method to take the roles 
  // in the object format and returns 
  // an array of roles
  public static getRoles(encodedRoles: Object): string[] {
    if (encodedRoles) {
      const roles = decodeURIComponent(encodedRoles.toString()).split(':');
      // we get the roles in this format before decoding 'j%3A%5B%22prd-admin%22%5D'
      // after deconding we get it in format 'j:["prd-admin"]'
      if (roles.length === 2) {
         let returnVal = JSON.parse(roles[1]);
         return returnVal;
      }
    }
    return [];
  }

}
