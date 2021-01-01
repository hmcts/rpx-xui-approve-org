;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Footer links', function () {

    beforeEach(function () {
        pa11yTestUserRoles(["prd-admin"]);
        MockApp.init();

    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });

    it('Accessibility Page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'accessibility',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-accessibility'));
        await pa11ytest(this, actions);
    });

    it('terms and Conditions page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'terms-and-conditions',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-terms-and-conditions'));
        await pa11ytest(this, actions);
    });

    it('Cookies Page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'cookies',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-cookie-policy'));
        await pa11ytest(this, actions);
    });

    it('Privacy policy page', async function () {
        await MockApp.startServer();
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'privacy-policy',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-privacy-policy'));
        await pa11ytest(this, actions);
    });

});


