;

const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults } = require('../helpers/pa11yUtil');
const {conf} = require('../config/config');

describe('Pa11y Accessibility tests', function () {

    conf.authenticatedUrls.forEach( page => {
        it('page url: ' + page.url, async function () {
            const actions = [];
            actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
            actions.push(...PallyActions.navigateTourl(conf.baseUrl + page.url,));
            actions.push(...PallyActions.waitForPageWithCssLocator(page.pageElementcss));
            await pa11ytest(this, actions);

        }).timeout(60000);
        
    });

    it('Pending Org Details Page: organisation-details/XXXX' , async function () {
        const actions = [];
        actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));

        await pa11ytest(this, actions);

    }).timeout(60000);
  
    it('Pending Org Confirm approval Page: /approve-organisations' , async function () {
        const actions = [];
        actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-approve'));

        await pa11ytest(this, actions);

    }).timeout(60000);


    it('Pending Org Approval Confirmation Page: /approve-organisations-success' , async function () {
        const actions = [];
        actions.push(...AppActions.idamLogin(conf.params.username, conf.params.password));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
        actions.push(...PallyActions.clickElement('td>a'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-approve'));
        actions.push(...PallyActions.clickElement('button'));
        actions.push(...PallyActions.waitForPageWithCssLocator('.govuk-panel--confirmation'));
        await pa11ytest(this, actions);

    }).timeout(60000)


});


