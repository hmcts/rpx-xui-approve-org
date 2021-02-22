

const assert = require('assert');
const path = require('path')

const MockApp = require('../../nodeMock/app');
const { browser } = require('protractor');
const BrowserUtil = require('../util/browserUtil');

const headerPage = require('../../e2e/features/pageObjects/headerPage');
const staffDetailsPage = require('../../e2e/features/pageObjects/staffDetailsPage');

const mockData = require('../../nodeMock/staffDetails/mockData');




describe('Staff details' , function () {

    beforeEach(async function (done) {
        await browser.manage().deleteAllCookies();
        MockApp.init();
        done();
    });
    afterEach(async function (done) {
        await MockApp.stopServer();
        done();
    });

    it('Upload without selecting file', async function () {
        await MockApp.startServer();
        await BrowserUtil.browserInitWithAuth(["prd-admin", "cwd-admin"]);

        await headerPage.waitForPrimaryNavDisplay()
        const features = await BrowserUtil.waitForLD();
        const tabs = await headerPage.getTabsDisplayed();
        expect(tabs.includes("Staff details"), 'Staff details tab not displayed ' + tabs).to.equal(true);
        await headerPage.clickTab('Staff details');
        await staffDetailsPage.amOnPage();
        expect(await staffDetailsPage.getTitle(), "Page header title does not match").to.equal('Upload staff details');

        await staffDetailsPage.clickUpload();
         expect(await staffDetailsPage.isErrorMessageBannerDisplayed(),"Error message banner not displayed when no file selected").to.be.true;
        expect(await staffDetailsPage.getInputFileErrorMessageDisplayed(), "Error message for file input is not displayed").to.be.true
        expect(await staffDetailsPage.getInputFileErrorMessage(), "Error message banner not displayed when no file selected").to.contain("You need to select a file to upload. Please try again.")


    });


    it('Upload success', async function () {
        const message = mockData.getSuccess(); 
 
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.send(message);
        });
        
        await uploadScenarioSteps();

        await staffDetailsPage.waitForUploadInfoDetails();
        expect(await staffDetailsPage.isSuccessMessageBannerPresent(), "Success message banner not displayed").to.be.true;
        expect(await staffDetailsPage.getUploadInfoDetails(), "Success message banner not displayed").to.equal(message.message_details);

    });


    it('Upload partial success', async function () {
        const message = mockData.getPartialSuccess(); 
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.send(message);
        });

        await uploadScenarioSteps();

        expect(await staffDetailsPage.isPartialSuccessPageDisplayed(), "Partial success details page not displayed").to.be.true;
        expect(await staffDetailsPage.isPartialSuccessDetailsTableDisplayed(), "Partial success details table not displayed").to.be.true;

    });

    it('Upload fail with 500', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.status(500).send(mockData.getErrorResponse('500'));
        });

        await uploadScenarioSteps();
        expect(await staffDetailsPage.isServiceDownMessageDisplayed(),"Service down message not displayed").to.be.true;
        

    });


    it('Upload fail with 401', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.status(401).send(mockData.getErrorResponse('401'));
        });

        await uploadScenarioSteps();
        expect(await staffDetailsPage.isUnauthorisedMessageDisplayed(), "user not authorised message not displayed").to.be.true;


    });

    it('Upload fail with 403', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.status(403).send(mockData.getErrorResponse('403'));
        });

        await uploadScenarioSteps();
        expect(await staffDetailsPage.isUnauthorisedMessageDisplayed(), "user not authorised message not displayed").to.be.true;


    });

    it('Upload fail with 400 missing headers', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            res.status(400).send(mockData.getErrorResponse('400'));
        });

        await uploadScenarioSteps();
        expect(await staffDetailsPage.isErrorMessageBannerDisplayed(), "Error message banner not displayed on 400 invald or missing headers").to.be.true;

    });
screenTop

});


async function uploadScenarioSteps(){
    await MockApp.startServer();
    await BrowserUtil.browserInitWithAuth(["prd-admin", "cwd-admin"]);

    await headerPage.waitForPrimaryNavDisplay()
    const features = await BrowserUtil.waitForLD();
    const tabs = await headerPage.getTabsDisplayed();
    expect(tabs.includes("Staff details"), 'Staff details tab not displayed ' + tabs).to.equal(true);
    await headerPage.clickTab('Staff details');
    await staffDetailsPage.amOnPage();
    expect(await staffDetailsPage.getTitle(), "Page header title does not match").to.equal('Upload staff details');


    let file = path.resolve(__dirname, '../../data/Staff Data Upload Template V1.0.1.xlsx');
    await staffDetailsPage.selectFile(file);
    await staffDetailsPage.clickUpload();
}
