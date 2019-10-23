const footerData =  {
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

const footerDataNavigation = {
  items: [
    { text: 'Accessibility', href: 'accessibility', target: '_blank'},
    { text: 'Terms and conditions', href: 'terms-and-conditions', target: '_blank' },
    { text: 'Cookies', href: 'cookies', target: '_blank' },
    { text: 'Privacy policy', href: 'privacy-policy', target: '_blank' }
  ]
};

const environmentNames: { [key: string]: EnvironmentNames} = {
  aat: 'aat',
  localhost: 'localhost',
  pr: 'pr',
  demo: 'demo',
  ithc: 'ithc',
  perftest: 'perftest',
  prod: 'prod'
};

const redirectUrl = {
  aat: 'https://idam-web-public.aat.platform.hmcts.net',
  demo: 'https://idam-web-public.demo.platform.hmcts.net',
  ithc: 'https://idam-web-public.ithc.platform.hmcts.net',
  perftest: 'https://idam-web-public.perftest.platform.hmcts.net',
  prod: 'https://hmcts-access.service.gov.uk',
  localhost: 'https://idam-web-public.aat.platform.hmcts.net',
  pr: ''
};

export type EnvironmentNames = 'aat' | 'localhost' | 'pr' | 'demo' | 'ithc' | 'perftest' | 'prod';

export class AppConstants {
  public static FOOTER_DATA = footerData;
  public static FOOTER_DATA_NAVIGATION = footerDataNavigation;
  public static REDIRECT_URL = redirectUrl;
  public static ENVIRONMENT_NAMES = environmentNames;
}
