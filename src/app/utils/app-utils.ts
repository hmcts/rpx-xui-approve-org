import { Organisation, OrganisationVM, OrganisationUser } from 'src/org-manager/models/organisation';
import { AppConstants } from '../app.constants';
import { User } from '@hmcts/rpx-xui-common-lib';

/**
 * Contains static stateless utility methods for the App
 *
 */
export class AppUtils {


  public static capitalizeString(stringToCapitalize: string) {
    const stringLowercase = stringToCapitalize.toLowerCase();
    const stringCapitalised = stringLowercase.charAt(0).toUpperCase() + stringLowercase.slice(1);
    return stringCapitalised;
  }

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
    organisationVm.dxNumber = apiOrg.contactInformation[0].dxAddress;
    organisationVm.addressLine1 = apiOrg.contactInformation[0].addressLine1;
    organisationVm.addressLine2 = apiOrg.contactInformation[0].addressLine2;
    organisationVm.postCode = apiOrg.contactInformation[0].postCode;
    organisationVm.townCity = apiOrg.contactInformation[0].townCity;
    organisationVm.county = apiOrg.contactInformation[0].county;
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
          dxAddress: org.dxNumber,
          postCode: org.postCode
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

  // [key: string]: any;
  // routerLink?: string;
  // fullName?: string;
  // email?: string;
  // status?: string;
  // resendInvite?: boolean;

  // userIdentifier: string;
  // firstName: string;
  // lastName: string;
  // email: string;
  // idamStatus: string;
  // idamStatusCode: string;
  // idamMessage: string;
  // roles: string[];

  public static mapUsers(obj: OrganisationUser[]): User[] {
    const users: User[] = [];
    if (obj) {
      obj.forEach((user) => {
        const newUser: User = {
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          resendInvite: false
        };
        AppConstants.USER_ROLES.forEach((userRoles) => {
          if (user.roles) {
            newUser[userRoles.roleType] = user.roles.includes(userRoles.role) ? 'Yes' : 'No';
          }
        });
        newUser.status = AppUtils.capitalizeString(user.idamStatus);
        users.push(newUser);
      });
    }
    return users;
  }
}
