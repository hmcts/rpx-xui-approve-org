const pendingOrganisation = require('./pendingOrganisations');
const activeOrganisation = require('./activeOrganisations');
const AppConfigMock = require('./mockdata/appConfig');


const requestMapping = {
   get:{
        '/auth/login': (req, res) => {
           res.set("location", "https://idam-web-public.aat.platform.hmcts.net/login?response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth2%2Fcallback&scope=profile%20openid%20roles%20manage-user%20create-user&state=q5GPi2LJ_2sXXDS4eCkPO5hbc3gybg1cl6U4V1ehdXk&client_id=xuiaowebapp")
            res.status(302).send();
        },
       '/auth/logout': (req,res) =>{
           res.set("location", "/auth/login")
           res.status(302).send();
       },
       '/api/environment/config': (req,res) => {

           res.send(AppConfigMock.getEnvConfig());
       },
       '/auth/isAuthenticated': (req,res) => {
            res.send(true);
       },
       '/api/organisations': (req,res) => {
           if(req.query.status){
               res.send(getOrganisationsWithStatus(req.query.status));
           }

           if (req.query.usersOrgId){
               res.send(getOrganisationsUsers(req.query.usersOrgId));
           }
       },
       '/api/pbaAccounts': (req,res) => {
           res.send(getPBAAccountNames(req.query.accountNames));
       },
       '/api/organisation': (req,res) => {
           res.send(getOrganisation());
       },
       '/external/configuration-ui': (req,res) => {
           res.send({"googleAnalyticsKey":"UA-124734893-4","idamWeb":"https://idam-web-public.aat.platform.hmcts.net","launchDarklyClientId":"5de6610b23ce5408280f2268","manageCaseLink":"https://xui-webapp-aat.service.core-compute-aat.internal/cases","manageOrgLink":"https://xui-mo-webapp-aat.service.core-compute-aat.internal","protocol":"http"});
       },
       '/external/configuration': (req,res) => {
           res.send(""+getConfigurationValue(req.query.configurationKey));
       },
       '/api/healthCheck': (req,res) => {
           res.send({"healthState":true});
       },
       '/api/userList':(req,res) => {
            res.send(getUsersList());
       },
       '/api/user/details': (req,res) => {
           res.send({ "email": "sreekanth_su1@mailinator.com", "orgId": "VRSFNPV", "roles": ["caseworker", "caseworker-divorce", "caseworker-divorce-financialremedy", "caseworker-divorce-financialremedy-solicitor", "caseworker-divorce-solicitor", "caseworker-ia", "caseworker-ia-legalrep-solicitor", "caseworker-probate", "caseworker-probate-solicitor", "caseworker-publiclaw", "caseworker-publiclaw-solicitor", "pui-caa", "pui-case-manager", "pui-finance-manager", "pui-organisation-manager", "pui-user-manager"], "sessionTimeout": { "idleModalDisplayTime": 10, "pattern": ".", "totalIdleTime": 20 }, "userId": "4510b778-6a9d-4c53-918a-c3f80bd7aadd" }); 
       },
       '/api/organisations/:OrgId/isDeletable' : (req,res) => {
           res.send({ "organisationDeletable": false }); 
       }
    },
    post:{
     '/api/reinviteUser': (req,res) => {
            res.send({ "userIdentifier": "97ecc487-cdeb-42a8-b794-84840a44f58c", "idamStatus": null });
     } 
    },
    put:{
        '/api/updatePba': (req,res) => {
            res.send('');
        },
        '/api/organisations/:orgId': (req,res) => {
            res.send({ value: 'Resource deleted successfully' });
        }
    },
    delete:{
        '/api/organisations/:orgId': (req,res) => {
            res.send({ value: 'Resource deleted successfully' });
        }
    }

}

const configurations = {
    'feature.termsAndConditionsEnabled':false

}

function getConfigurationValue(configurationKey){
    return configurations[configurationKey]; 
}

function getOrganisationsWithStatus(status){
    if (status === 'PENDING'){
        return pendingOrganisation;
    }else if(status === 'ACTIVE'){
        return activeOrganisation;
    }else{
        return [];
    }
}

function getPBAAccountNames(accountStringArray){
    return accountStringArray.split(',').map(account => {return  {
        "account_number": account,
        "account_name": "Test Mock name for PBA LIMITED",
        "credit_limit": 100000,
        "available_balance": 87355.83,
        "status": "Active",
        "effective_date": "2020-08-05T19:30:08.000Z"
    }}); 
}

function getOrganisationsUsers(orgId){
    return {
        "organisationIdentifier": "1895V8L",
        "users": [
            {
                "userIdentifier": "682f61ba-29c1-4ceb-8de1-5287f28e1aee",
                "firstName": "some-fname",
                "lastName": "some-lname",
                "email": "lhugw5y@hmcts.net",
                "idamStatus": "PENDING",
                "roles": null,
                "idamStatusCode": " ",
                "idamMessage": "19 No call made to SIDAM to get the user roles as user status is not 'ACTIVE'"
            },
            {
                "userIdentifier": "aaa8b709-01b0-4477-bf2d-1892c7a1b394",
                "firstName": "someName",
                "lastName": "someLastName",
                "email": "lcrdeuzpeb@hotmail.com",
                "idamStatus": "PENDING",
                "roles": null,
                "idamStatusCode": " ",
                "idamMessage": "19 No call made to SIDAM to get the user roles as user status is not 'ACTIVE'"
            },
            {
                "userIdentifier": "2d595c38-43cd-4c9d-88b0-5bf7315302ec",
                "firstName": "test active",
                "lastName": "test",
                "email": "testfn.tesln@hmcts.net",
                "idamStatus": "ACTIVE",
                "roles": [
                    "caseworker-probate",
                    "pui-finance-manager",
                    "caseworker-probate-solicitor",
                    "pui-user-manager",
                    "caseworker-divorce",
                    "pui-case-manager",
                    "caseworker-divorce-financialremedy",
                    "caseworker-divorce-solicitor",
                    "caseworker-divorce-financialremedy-solicitor",
                    "caseworker",
                    "pui-organisation-manager"
                ],
                "idamStatusCode": "200",
                "idamMessage": "11 OK"
            }
        ]
    };
}



module.exports = { requestMapping,configurations};

