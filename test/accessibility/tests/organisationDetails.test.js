
const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles, initBrowser } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Organisations details', function () {
    beforeEach(function () {

    });
    afterEach(async function () {

    });

    it('Active oraganisation details page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/ACT123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        await pa11ytest(this, actions);
    });

    it('Active oraganisation Users page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/ACT123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        await pa11ytest(this, actions);
    });


    it('Pending oraganisation details page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/PEN123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        await pa11ytest(this, actions);
    });


});

