;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles} = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Pa11y Accessibility tests', function () {

    beforeEach(function () {
        pa11yTestUserRoles(["prd-admin"]);
        MockApp.init();

    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });


    it('Active Organisation with Users tab', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        await pa11ytest(this, actions);

    });

    it('Active Organisation with Pending Users details page', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.clickElement('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-details table'));
        await pa11ytest(this, actions);

    });


    it('Active Organisation with Pending User invite user page', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.clickElement('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-details table'));
        actions.push(...PallyActions.clickElement('#resend-invite-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component xuilib-invite-user-form form'));

        await pa11ytest(this, actions);

    });

    it('Active Organisation with Pending User invite user Error', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });
        await MockApp.startServer();
        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.clickElement('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-details table'));
        actions.push(...PallyActions.clickElement('#resend-invite-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component xuilib-invite-user-form form'));
        actions.push(...PallyActions.clickElement('xuilib-invite-user-form button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component .govuk-error-summary .govuk-error-summary__body'));
        await pa11ytest(this, actions);

    });

    it('Active Organisation with Pending User invite user Success', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });
        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.clickElement('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-details table'));
        actions.push(...PallyActions.clickElement('#resend-invite-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component xuilib-invite-user-form form'));
        actions.push(...PallyActions.checkField('xuilib-invite-permission-form #roles'));
        actions.push(...PallyActions.clickElement('xuilib-invite-user-form button'));

        actions.push(...PallyActions.waitForPageWithCssLocator('app-reinvite-user-success h1'));
        await pa11ytest(this, actions);

    });


    it('Active Organisation with Pending User invite user error already invite', async function () {
        MockApp.onGet('/auth/isAuthenticated', (req, res) => {
            res.cookie('roles', 'j:["xui-approver-userdata", "prd-admin"]')
            res.send(true);
        });

        MockApp.onPost('/api/reinviteUser', (req, res) => {
            res.status(429).send({
                "apiError": "10 : The request was last made less than 60 minutes ago. Please try after some time",
                "apiStatusCode": 429,
                "message": "429 10 : The request was last made less than 60 minutes ago. Please try after some time"
            });
        })

        await MockApp.startServer();

        const actions = [];
        actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'organisation-details/FNTFJSY'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('.hmcts-sub-navigation li:nth-of-type(2) a'));

        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.clickElement('xuilib-user-list tbody tr td a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('xuilib-user-details table'));
        actions.push(...PallyActions.clickElement('#resend-invite-button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component xuilib-invite-user-form form'));
        actions.push(...PallyActions.checkField('xuilib-invite-permission-form #roles'));
        actions.push(...PallyActions.clickElement('xuilib-invite-user-form button'));

        actions.push(...PallyActions.waitForPageWithCssLocator('app-prd-reinvite-user-component .hmcts-banner--warning .hmcts-banner__message'));
        await pa11ytest(this, actions);

    });


});


