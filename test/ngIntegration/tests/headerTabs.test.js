;


const assert = require('assert');

const MockApp = require('../../nodeMock/app');
const { browser } = require('protractor');
const BrowserUtil = require('../util/browserUtil');
const BrowserWaits = require('../../e2e/support/customWaits');

const headerPage = require('../../e2e/features/pageObjects/headerPage');

describe('Header  Tabs', function () {

    beforeEach(async function (done) {
        await browser.manage().deleteAllCookies();
        MockApp.init();
        done();
    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });

    it('Organisation tab present for prd-admin', async function () {
        ;

        await MockApp.startServer();
        await BrowserUtil.browserInitWithAuth(["prd-admin"]);   

        await headerPage.waitForPrimaryNavDisplay() 
        await BrowserUtil.waitForLD();
        const tabs = await headerPage.getTabsDisplayed(); 
        expect(tabs, 'Organisation tab not displayed ' + tabs).to.contain("Organisations")

    });

    it('Case worker tab present for pui-xxx user (caseworker manager role)', async function () {
  
        await MockApp.startServer();
    
        await BrowserUtil.browserInitWithAuth(["pui-caa"]);

        await headerPage.waitForPrimaryNavDisplay()
        await BrowserUtil.waitForLD();
        const tabs = await headerPage.getTabsDisplayed(); 
        expect(tabs, 'Organisation tab not displayed ' + tabs).to.contain("Caseworker details")

    });

        
});


