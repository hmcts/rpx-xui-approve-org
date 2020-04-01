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

export class AppConstants {
  public static FOOTER_DATA = FooterData;
  public static FOOTER_DATA_NAVIGATION = FooterDataNavigation;
  public static ENVIRONMENT_NAMES = environmentNames;
  public static USER_ROLES = userRoles;
  public static XUI_APPROVAL_ROLE = xuiApprovalRole;
  public static CCD_ROLES = ccdRoles;
}
