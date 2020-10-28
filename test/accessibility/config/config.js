const conf = {
<<<<<<< HEAD
    reportPath: "reports/tests/a11y/",
    appName:"Approve Organisation",
    baseUrl:'https://administer-orgs.aat.platform.hmcts.net/',
    params:{
        username:'vmuniganti@mailnesia.com',
        password:'Monday01'
    },
=======
    headless:true,
    failTestOna11yIssues: false,
    reportPath: "reports/tests/a11y/",
    appName:"Approve Organisation",
    baseUrl1:'https://administer-orgs.aat.platform.hmcts.net/',
    baseUrl: 'http://localhost:4200/', 
>>>>>>> master
    authenticatedUrls: [
        {
            url: 'pending-organisations',
            pageElementcss:'td>a'
        },
        {
            url: 'active-organisation',
            pageElementcss: 'td>a'
<<<<<<< HEAD
        },
        {
            url: 'organisation-details/S6KFS1X',
            pageElementcss: '.govuk-check-your-answers'
=======
>>>>>>> master
        }
    
    ],
    unauthenticatedUrls: [],

}

module.exports = {conf}

