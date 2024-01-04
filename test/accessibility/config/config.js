const conf = {
  headless: true,
  failTestOna11yIssues: false,
  reportPath: 'functional-output/codecept-a11y/',
  appName: 'Approve Organisation',
  baseUrl1: 'https://administer-orgs.aat.platform.hmcts.net/',
  baseUrl: 'http://localhost:3000/',
  authenticatedUrls: [
    {
      url: 'pending-organisations',
      pageElementcss: 'td>a'
    },
    {
      url: 'active-organisation',
      pageElementcss: 'td>a'
    }

  ],
  unauthenticatedUrls: []

};

module.exports = { conf };

