const FooterData =  {
  heading: 'Help',
  email: {
    address: 'service-desk@hmcts.gov.uk',
    text: 'service-desk@hmcts.gov.uk'
  },
  phone: {
    text: '0207 633 4140'
  },
  opening: {
    text: 'Monday to Friday, 8am to 6pm (excluding public holidays)'
  }
};

const FooterDataNavigation = {
  items: [
    { text: 'Accessibility', href: 'accessibility', target: '_blank'},
    { text: 'Terms and conditions', href: 'terms-and-conditions', target: '_blank' },
    { text: 'Cookies', href: 'cookies', target: '_blank' },
    { text: 'Privacy policy', href: 'privacy-policy', target: '_blank' }
  ]
};

const environmentNames = {
  aat: 'aat',
  localhost: 'localhost',
  pr: 'pr-',
  demo: 'demo',
  ithc: 'ithc',
  perftest: 'perftest',
  prod: 'prod'
};

const xuiApprovalRole = 'xui-approver-userdata';


const userRoles = [

  { role: 'pui-organisation-manager', roleType: 'manageOrganisations'},
  { role: 'pui-user-manager', roleType: 'manageUsers' },
  { role: 'pui-case-manager', roleType: 'manageCases'}
];

const ccdRoles = [
  'caseworker',
  'caseworker-divorce',
  'caseworker-divorce-solicitor',
  'caseworker-divorce-financialremedy',
  'caseworker-divorce-financialremedy-solicitor',
  'caseworker-probate',
  'caseworker-ia',
  'caseworker-probate-solicitor',
  'caseworker-publiclaw',
  'caseworker-ia-legalrep-solicitor',
  'caseworker-publiclaw-solicitor'
];

const superUserRoles = [
  'pui-organisation-manager',
  'pui-user-manager',
  'pui-case-manager',
  ...ccdRoles
];



export const errorMessageMappings = {
  1: 'A user with this email address already exists',
  2: 'Something went wrong, ensure you have entered all the fields below',
  3: 'This SRA number has already been used. Enter a different SRA number.',
  4: 'PBA number must begin with PBA and be length 10',
  5: 'PBA number already exists',
  6: 'DX exchange cant be null',
  7: 'DX number can not be null',
  8: 'Dx number can not be null',
  9: 'Sorry, there is a problem with the service. Try again later',
  10: 'This SRA number has already been used. Enter a different SRA number.',
  11: 'This PBA number has already been used. Enter a different PBA number.',
};

export const apiErrors = {
  1: 'email_address',
  2: 'Validation failed',
  3: 'sra_id_uq1',
  4: 'pbaNumber',
  5: 'pba_number',
  6: 'dx_exchange',
  7: 'dx_number',
  8: 'DxAddress',
  10: 'SRA_ID Invalid or already exists',
  11: 'PBA_NUMBER Invalid or already exists',
};

export const navItemsArray = [{
  text: 'Organisations',
  href: '/pending-organisations',
  active: true
},
{
  text: 'Caseworker details',
  href: '/caseworker-details',
  active: false
}
];

const roleBasedNav = {
  'prd-admin': navItemsArray[0],
  'pui-caa': navItemsArray[1]
};

const featureNames = {
  caseworkerDetails: 'case-worker-details'
};

export class AppConstants {
  public static FOOTER_DATA = FooterData;
  public static FOOTER_DATA_NAVIGATION = FooterDataNavigation;
  public static ENVIRONMENT_NAMES = environmentNames;
  public static USER_ROLES = userRoles;
  public static XUI_APPROVAL_ROLE = xuiApprovalRole;
  public static CCD_ROLES = ccdRoles;
  public static ERROR_MESSAGE_MAPPINGS = errorMessageMappings;
  public static API_ERRORS = apiErrors;
  public static SUPER_USER_ROLES = superUserRoles;
  public static NAVITEMS = navItemsArray;
  public static ROLES_BASED_NAV = roleBasedNav;
  public static FEATURE_NAMES = featureNames;
}
