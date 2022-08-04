'use strict';

/*
  Code adapted from https://github.com/hmcts/rpx-xui-manage-organisations/blob/master/test/e2e/features/step_definitions/createOrganisation.steps.js
*/

const { config } = require('../../config/conf');
const BrowserWaits = require('../../support/customWaits')

const loginPage = require('../pageObjects/loginLogoutObjects');
const CreateOrganisationObject = require('../pageObjects/createOrganisationObjects');
const createOrganisationObject = new CreateOrganisationObject();

class CreateOrganisationFlow {

  async navigateToRegisterOrg() {
    await browser.driver.manage().deleteAllCookies();
    await browser.get(config.registerOrgUrl);
    if ((await browser.getCurrentUrl()).startsWith('https://login.microsoftonline.com/')) {
      await loginPage.microsoftSignIn();
    }
  }

  async startRegistration() {
    await browser.get(config.registerOrgUrl + '/register-org/register');
    await BrowserWaits.waitForElement($('.govuk-heading-xl'));
    try {
      await expect(createOrganisationObject.start_button.isDisplayed(), "Create Organisation START button not present").to.eventually.be.true;
      await expect(createOrganisationObject.start_button.getText())
        .to
        .eventually
        .equal('Start');
      await createOrganisationObject.start_button.click();
    } catch (err) {
      await browser.get(config.registerOrgUrl + '/register-org/register');
      throw new Error(err);
    }
  }

  async enterOrgName() {
    await this.amOnPage("What's the name of your organisation?");
    await expect(createOrganisationObject.org_name.isDisplayed(), "Input Organisation name nor present").to.eventually.be.true;
    await createOrganisationObject.enterOrgName();
    await createOrganisationObject.continue_button.click();
  }

  async enterOfficeAddressDetails() {
    await this.amOnPage("What's the address of your main office?");
    await expect(createOrganisationObject.officeAddressOne.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.officeAddressOne.sendKeys("1, Cliffinton");
    await expect(createOrganisationObject.townName.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.townName.sendKeys("London");
    await expect(createOrganisationObject.postcode.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.postcode.sendKeys("SE15TY");
    await createOrganisationObject.continue_button.click();
  }

  async enterPbaDetails() {
    await this.amOnPage("What's your payment by account (PBA) number for your organisation?");
    await createOrganisationObject.PBAnumber1.isDisplayed();
    await createOrganisationObject.enterPBANumber();
    await createOrganisationObject.addAnotherPbaNumber.click();
    await createOrganisationObject.PBAnumber2.isDisplayed();
    await createOrganisationObject.enterPBA2Number();
    await createOrganisationObject.continue_button.click();
  }

  async enterDxRefDetails() {
    await this.amOnPage("Do you have a DX reference for your main office?");
    await createOrganisationObject.clickDXreferenceCheck();
    await createOrganisationObject.DXNumber.isDisplayed();
    await createOrganisationObject.enterDXNumber();
    await createOrganisationObject.DXexchange.isDisplayed();
    await createOrganisationObject.enterDXENumber();
    await createOrganisationObject.continue_button.click();
  }

  async enterSraNumber() {
    await this.amOnPage("Do you have an organisation SRA ID?");
    await createOrganisationObject.clickSRAreferenceCheck();
    await expect(createOrganisationObject.SRANumber.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.enterSRANumber();
    await createOrganisationObject.continue_button.click();
  }

  async enterFirstnameLastname() {
    await this.amOnPage("What's your name?");
    expect(createOrganisationObject.firstName.isDisplayed()).to.eventually.be.true;
    expect(createOrganisationObject.lastName.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.enterUserFirstandLastName();
    await createOrganisationObject.continue_button.click();
  }

  async enterEmailAddess() {
    await this.amOnPage("What's your email address?");
    await expect(createOrganisationObject.emailAddr.isDisplayed()).to.eventually.be.true;
    global.latestOrgSuperUser = Math.random().toString(36).substring(2) + "@mailinator.com";
    global.latestOrgSuperUserPassword = "Monday01";
    await createOrganisationObject.enterEmailAddress(global.latestOrgSuperUser);
    await createOrganisationObject.continue_button.click();
  }

  async checkSummaryAndSubmit() {
    await this.amOnPage("Check your answers before you register");
    await expect(createOrganisationObject.submit_button.isDisplayed()).to.eventually.be.true;
    await expect(createOrganisationObject.submit_button.getText())
      .to
      .eventually
      .equal('Confirm and submit details');
    await createOrganisationObject.submit_button.click();
  }

  async checkOrgCreationSuccessful() {
    createOrganisationObject.waitForSubmission();
    await expect(createOrganisationObject.org_success_heading.isDisplayed()).to.eventually.be.true;
    await expect(createOrganisationObject.org_success_heading.getText())
      .to
      .eventually
      .equal('Registration details submitted');
  }

  async amOnPage(page) {
    await createOrganisationObject.waitForPage(page);
  }

}


module.exports = CreateOrganisationFlow;
