;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults } = require('../helpers/pa11yUtil');
const {conf} = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Pa11y Accessibility tests', function () {

    beforeEach(function () {
        MockApp.init();

    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });


    it('Pending oraganisations page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'pending-organisations',));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        await pa11ytest(this, actions);

    });

    it('Active oraganisations page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'active-organisation',));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        await pa11ytest(this, actions);

    });

    it('Pending Org Details Page: organisation-details/XXXX' , async function () {
        await MockApp.startServer();

        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));

        await pa11ytest(this, actions);

    });
  
    it('Pending Org Confirm approval Page: /approve-organisations' , async function () {
        await MockApp.startServer();

        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-approve'));

        await pa11ytest(this, actions);

    });


    it('Pending Org Approval Confirmation Page: /approve-organisations-success' , async function () {
        await MockApp.startServer();

        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-approve'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('.govuk-panel--confirmation'));
        await pa11ytest(this, actions);

    });


    it('Update PBA page', async function () {
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl+'change/pba/FNTFJSY/PBA1662855,PBA2926712'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-change-details'));;
        await pa11ytest(this, actions);

    });

    it('Update PBA page with error', async function () {
        MockApp.onPut('/api/updatePba', (req,res) => {
            res.status(400).send({ "apiError": { "errorMessage": "3 : There is a problem with your request. Please check and try again", "errorDescription": "The PBA numbers you have entered: PBA1234567 belongs to another Organisation", "timeStamp": "06-08-2020 12:37:35.038" }, "apiStatusCode": 400, "message": "handleUpdatePBARoute error" });
        });
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'change/pba/FNTFJSY/PBA1662855,PBA2926712'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-change-details'));
        actions.push(...PallyActions.waitForPageWithCssLocator('#pba1'));
        actions.push(...PallyActions.inputField('#pba1','PBA1234567'));
        actions.push(...PallyActions.clickElement('app-change-details form button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-change-details .govuk-error-summary__list span'));
        await pa11ytest(this, actions);

    });


});


