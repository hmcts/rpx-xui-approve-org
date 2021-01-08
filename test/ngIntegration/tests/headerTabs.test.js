;


const assert = require('assert');

const MockApp = require('../../nodeMock/app');
const { browser } = require('protractor');
const BrowserUtil = require('../util/browserUtil');
const BrowserWaits = require('../../e2e/support/customWaits');

const headerPage = require('../../e2e/features/pageObjects/headerPage');
const idamPage = require('../../e2e/features/pageObjects/loginLogoutObjects');

const AppConfigMock = require('../../nodeMock/mockdata/appConfig');

[
    { env: "Test", ldDlientId: "5de6610b23ce5408280f2268" } 
].forEach(feature => {
    describe('Header  Tabs for env ' + feature.env, function () {

        beforeEach(async function (done) {
            await browser.manage().deleteAllCookies();
            MockApp.init();
            MockApp.onGet('api/environment/config', ( req,res) => {
                const envConfig = AppConfigMock.getEnvConfig();
                envConfig["launchDarklyClientId"] = feature.ldDlientId;
                res.send(envConfig); 
            });
            done();
        });
        afterEach(async function (done) {
            await MockApp.stopServer();
            done();
        });

        it('Organisation tab present for prd-admin', async function () {
            await MockApp.startServer();
            await BrowserUtil.browserInitWithAuth(["prd-admin"]);

            await headerPage.waitForPrimaryNavDisplay()
            const features = await BrowserUtil.waitForLD();
            const tabs = await headerPage.getTabsDisplayed();
            expect(tabs.includes("Organisations"), 'Organisation tab not displayed ' + tabs).to.equal(true);

        });


        it('Organisation tabs and Caseworker details present for prd-admin and Casewrker manager role', async function () {
            await MockApp.startServer();
            await BrowserUtil.browserInitWithAuth(["prd-admin", "cwd-admin"]);

            await headerPage.waitForPrimaryNavDisplay()
            const features = await BrowserUtil.waitForLD();
            const tabs = await headerPage.getTabsDisplayed();
            expect(tabs.includes("Organisations"), 'Organisation tab not displayed ' + tabs).to.equal(true);
            expect(tabs.includes("Caseworker details"), 'Caseworker tab not displayed ' + tabs).to.equal(features["ao-case-worker-details"].value);

        });

        it('Case worker tab present for user (caseworker admin) role cwd-admin', async function () {

            await MockApp.startServer();
            await BrowserUtil.browserInitWithAuth(["cwd-admin"]);

            await headerPage.waitForPrimaryNavDisplay()
            const features = await BrowserUtil.waitForLD();
            const tabs = await headerPage.getTabsDisplayed();

            expect(tabs.includes("Organisations"), 'Organisation tab displayed ' + tabs).to.equal(false);

            if (features["ao-case-worker-details"].value) {
                expect(tabs.includes("Caseworker details"), 'Caseworker details not displayed with feature enabled' + tabs).to.equal(true);
            } else {
                expect(await idamPage.isLoginPageDisplayed(), "Idamn login page not displayed with caseworker details feature disabled").to.be.true;
            }

        });


    });
})



