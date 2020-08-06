;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Delete Organisation', function () {

    beforeEach(function () {
        MockApp.init();

    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });


    it('Pending Org Delete registration request Page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('app-org-details-info .delete-org-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
        await pa11ytest(this, actions);

    });

    it('Pending Org Delete success page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('app-org-details-info .delete-org-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
        actions.push(...PallyActions.clickElement('app-org-pending-delete .govuk-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-delete-success h1'));
        await pa11ytest(this, actions);

    });

    it.skip('Pending Org Delete error 400 page', async function () {
        MockApp.onDelete('/api/organisations/:orgId', (req,res) => {
            res.status(400).send('Organisation id is missing')
        });
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('app-org-details-info .delete-org-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
        actions.push(...PallyActions.clickElement('app-org-pending-delete .govuk-button'));

        await pa11ytest(this, actions);

    });

    it.skip('Pending Org Delete error page', async function () {
        MockApp.onDelete('/api/organisations/:orgId', (req, res) => {  
            res.status(500).send({
                apiError: "Mock error message", apiStatusCode: 500,
                message: 'handlePutOrganisationRoute error'
            })
        });
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('app-org-details-info .delete-org-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
        await pa11ytest(this, actions);

    });





});


