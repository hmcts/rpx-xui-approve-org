;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Delete Organisation', function () {

    beforeEach(function () {
        pa11yTestUserRoles(["prd-admin"]);
        MockApp.init();

    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });

    function getOrgDeleteButtonCss(orgStatus){
        return orgStatus === 'ACTIVE' ? 'app-org-details-info .govuk-button' : 'app-org-details-info .delete-org-button';
    }

    ['PENDING','ACTIVE'].forEach(state => {
        it(state+' Org Delete registration request Page', async function () {
            MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req,res) => {
                res.send({ "organisationDeletable": true });
            }); 
            await MockApp.startServer();
            const actions = [];

           if(state === 'ACTIVE'){
               actions.push(...PallyActions.waitForPageWithCssLocator('.pending-organisations'));
               actions.push(...PallyActions.clickElement('.govuk-tabs__list li:nth-of-type(3) a'));
               actions.push(...PallyActions.waitForPageWithCssLocatorNotPresent('.pending-organisations'));
               actions.push(...PallyActions.waitForPageWithCssLocator('.active-organisations'));
               actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));


            //    actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'approve-organisations'));
            } 
            actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
            actions.push(...PallyActions.clickElement('td>a'));
            actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));

            actions.push(...PallyActions.clickElement(getOrgDeleteButtonCss(state)));
            actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
            await pa11ytest(this, actions);

        });

        it(state+' Org Delete success page', async function () {
            MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req, res) => {
                res.send({ "organisationDeletable": true });
            }); 
            await MockApp.startServer();
            const actions = [];
            // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
            if (state === 'ACTIVE') {
              actions.push(...PallyActions.waitForPageWithCssLocator('.pending-organisations'));
              actions.push(...PallyActions.clickElement('.govuk-tabs__list li:nth-of-type(3) a'));
              actions.push(...PallyActions.waitForPageWithCssLocatorNotPresent('.pending-organisations'));
              actions.push(...PallyActions.waitForPageWithCssLocator('.active-organisations'));
              actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));

                // actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'approve-organisations'));
            } 
            actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
            actions.push(...PallyActions.clickElement('td>a'));
            actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
            actions.push(...PallyActions.clickElement(getOrgDeleteButtonCss(state)));
            actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
            actions.push(...PallyActions.clickElement('app-org-pending-delete .govuk-button'));
            actions.push(...PallyActions.waitForPageWithCssLocator('app-delete-success h1'));
            await pa11ytest(this, actions);

        });
    });

   
    

    ['PENDING', 'ACTIVE'].forEach(state => {
        const actions = [];
        if (state === 'ACTIVE') {

          actions.push(...PallyActions.waitForPageWithCssLocator('.pending-organisations'));
          actions.push(...PallyActions.clickElement('.govuk-tabs__list li:nth-of-type(3) a'));
          actions.push(...PallyActions.waitForPageWithCssLocatorNotPresent('.pending-organisations'));
          actions.push(...PallyActions.waitForPageWithCssLocator('.active-organisations'));
          actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));

            // actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'approve-organisations'));
        }
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement(getOrgDeleteButtonCss(state)));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
        actions.push(...PallyActions.clickElement('app-org-pending-delete .govuk-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-service-down h1'));

        it(state + ' Org Delete error 400 404 page', async function () {
            MockApp.onDelete('/api/organisations/:orgId', (req, res) => {
                res.status(400).send('Organisation id is missing')
            });
            MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req, res) => {
                res.send({ "organisationDeletable": true });
            }); 
            await MockApp.startServer(); 
            await pa11ytest(this, actions);

        });

        it(state + ' Org Delete error 403 page', async function () {
            MockApp.onDelete('/api/organisations/:orgId', (req, res) => {
                res.status(403).send({
                    apiError: "Mock error message", apiStatusCode: 403,
                    message: 'handlePutOrganisationRoute error'
                })
            });
            MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req, res) => {
                res.send({ "organisationDeletable": true });
            }); 
            await MockApp.startServer();
            await pa11ytest(this, actions);

        });

        it(state + ' Org Delete error page', async function () {
            MockApp.onDelete('/api/organisations/:orgId', (req, res) => {
                res.status(500).send({
                    apiError: "Mock error message", apiStatusCode: 500,
                    message: 'handlePutOrganisationRoute error'
                })
            });
            MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req, res) => {
                res.send({ "organisationDeletable": true });
            }); 
            await MockApp.startServer();
            await pa11ytest(this, actions);

        });
    });




});


