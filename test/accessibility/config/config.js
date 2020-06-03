const conf = {
    reportPath: "reports/tests/a11y/",
    appName:"Approve Organisation",
    baseUrl:'https://administer-orgs.aat.platform.hmcts.net/',
    params:{
        username:'vmuniganti@mailnesia.com',
        password:'Monday01'
    },
    authenticatedUrls: [
        {
            url: 'pending-organisations',
            pageElementcss:'td>a'
        },
        {
            url: 'active-organisation',
            pageElementcss: 'td>a'
        },
        {
            url: 'organisation-details/S6KFS1X',
            pageElementcss: '.govuk-check-your-answers'
        }
    
    ],
    unauthenticatedUrls: [],

}

module.exports = {conf}

