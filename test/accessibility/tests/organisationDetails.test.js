
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

    xit('Active oraganisation details page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/ACT123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        await pa11ytest(this, actions);
    });

    xit('Active oraganisation Users page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/ACT123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation__item:nth-of-type(2)'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list'));

        await pa11ytest(this, actions);
    });


    xit('Pending oraganisation details page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/PEN123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        await pa11ytest(this, actions);
    });


    xit('Pending oraganisation confirm decision page', async function () {
        await initBrowser()
        const actions = [];
        // actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/PEN123',));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.govuk-radios__item:nth-of-type(1) input'));
        actions.push(...PallyActions.clickElement('button.govuk-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-approve'));


        await pa11ytest(this, actions);
    });


});

