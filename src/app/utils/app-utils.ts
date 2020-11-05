import { User } from '@hmcts/rpx-xui-common-lib';
import { Organisation, OrganisationUser, OrganisationVM } from 'src/org-manager/models/organisation';
import { AppConstants } from '../app.constants';
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
      default: {
        // do nothing
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
        organisationIdentifier: (org.organisationId || '').trim(),
        sraId: (org.sraId || '').trim(),
        contactInformation: [{
          addressLine1: (org.addressLine1 || '').trim(),
          addressLine2: (org.addressLine2 || '').trim(),
          townCity: (org.townCity || '').trim(),
          county: (org.county || '').trim(),
          dxAddress: null,
          postCode: (org.postCode || '').trim()
          }],
        superUser: {
          userIdentifier: (org.admin || '').trim(),
          firstName: (org.admin || '').trim(),
          lastName: (org.admin || '').trim(),
          email: (org.adminEmail || '').trim()
        },
        status: 'ACTIVE',
        name: (org.name || '').trim(),
        paymentAccount: org.pbaNumber
      };
      if (org.dxNumber.length && org.dxNumber[0].dxNumber) {
        organisation.contactInformation[0].dxAddress = [{
          dxNumber: org.dxNumber[0].dxNumber.trim(),
          dxExchange: org.dxNumber[0].dxExchange.trim()
        }];
      } else {
        organisation.contactInformation[0].dxAddress = [{
          dxNumber: '',
          dxExchange: ''
        }];
      }
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

}
