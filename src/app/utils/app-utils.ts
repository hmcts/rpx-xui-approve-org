import { Organisation, OrganisationVM } from 'src/org-manager/models/organisation';

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
      const organisation = new OrganisationVM();
      organisation.name = apiOrg.name;
      organisation.adminEmail = apiOrg.superUser.email;
      organisation.pbaNumber = apiOrg.paymentAccount;
      organisation.organisationId = apiOrg.organisationIdentifier;
      organisation.view = 'View';
      organisation.status = apiOrg.status;
      organisation.admin = `${apiOrg.superUser.firstName} ${apiOrg.superUser.lastName}`;
      organisation.dxNumber = apiOrg.contactInformation[0].dxAddress;
      organisation.address = `${apiOrg.contactInformation[0].addressLine1},
      ${apiOrg.contactInformation[0].county ? apiOrg.contactInformation[0].county + ',' : ''}
      ${apiOrg.contactInformation[0].townCity}`;
      organisation.sraId = apiOrg.sraId;
      organisationModel.push(organisation);
    });

    return organisationModel;
  }

  static mapOrganisationsVm(obj: OrganisationVM[]): Organisation[] {
    const organisations: Organisation[] = [];
    obj.forEach((org) => {
      const organisation: Organisation = {
        organisationIdentifier: org.organisationId,
        sraId: org.sraId,
        contactInformation: [{
          addressLine1: org.address,
          townCity: org.address,
          county: org.address,
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
}
