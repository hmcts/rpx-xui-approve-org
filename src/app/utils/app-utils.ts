import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';
import { AppConstants } from '../app.constants';

/**
 * Contains static stateless utility methods for the App
 *
 */
export class AppUtils {

  static setPageTitle(url): string {
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

  static mapOrganisations(obj: Organisation[]): OrganisationVM[] {
    const organisationModel: OrganisationVM[] = [];
    obj.forEach((apiOrg) => {
      organisationModel.push(this.mapOrganisation(apiOrg));
    });

    return organisationModel;
  }

  static mapOrganisation(apiOrg: Organisation): OrganisationVM {
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
    organisationVm.townCity = apiOrg.contactInformation[0].townCity;
    organisationVm.county = apiOrg.contactInformation[0].county;
    organisationVm.postCode = apiOrg.contactInformation[0].postCode;
    organisationVm.sraId = apiOrg.sraId;
    return organisationVm;
  }

  static mapOrganisationsVm(obj: OrganisationVM[]): Organisation[] {
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
  static getEnvironment(url: string): string {
    const regex = 'pr-|localhost|aat|demo|ithc|perftest';
    const matched = url.match(regex);

    if (matched && matched[0]) {
        switch (matched[0]) {
          case AppConstants.ENVIRONMENT_NAMES.aat:
          case AppConstants.ENVIRONMENT_NAMES.localhost:
          case AppConstants.ENVIRONMENT_NAMES.pr:
             return AppConstants.ENVIRONMENT_NAMES.aat;
          case AppConstants.ENVIRONMENT_NAMES.demo:
              return AppConstants.ENVIRONMENT_NAMES.demo;
          case AppConstants.ENVIRONMENT_NAMES.ithc:
              return AppConstants.ENVIRONMENT_NAMES.ithc;
          case AppConstants.ENVIRONMENT_NAMES.perftest:
              return AppConstants.ENVIRONMENT_NAMES.perftest;
        }
      }
    return AppConstants.ENVIRONMENT_NAMES.prod;
  }
}
