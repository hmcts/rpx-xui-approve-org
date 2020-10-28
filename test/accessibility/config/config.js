const conf = {
    headless:true,
    failTestOna11yIssues: false,
    reportPath: "reports/tests/a11y/",
    appName:"Approve Organisation",
    baseUrl1:'https://administer-orgs.aat.platform.hmcts.net/',
    baseUrl: 'http://localhost:4200/', 
    authenticatedUrls: [
        {
            url: 'pending-organisations',
            pageElementcss:'td>a'
        },
        {
            url: 'active-organisation',
            pageElementcss: 'td>a'
        }
    
    ],
    unauthenticatedUrls: [],

}

module.exports = {conf}

