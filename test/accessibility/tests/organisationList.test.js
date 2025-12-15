
const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles, initBrowser } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Organisations list', function () {
    // beforeEach(function () {
       
    // });
    // afterEach(async function () {
        
    // });

    it('Pending oraganisations page', async function () {
        await initBrowser()
        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation/pending',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-pending-overview-component'));
        await pa11ytest(this, actions);
    });

    it('Active oraganisations page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation/active',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-org-overview-component'));
        await pa11ytest(this, actions);
    });

  

});

