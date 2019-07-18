'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const { defineSupportCode } = require('cucumber');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const EC = protractor.ExpectedConditions;
let address = "" ;
let administrator = ""; let orgName = "";

async function waitForElement(el) {
    await browser.wait(result => {
        return element(by.className(el)).isPresent();
    }, 600000);
}

defineSupportCode(function ({ Given, When, Then }) {

    Then(/^I Select the Organisation and get the details and click Activate$/, async function () {
      await bannerPage.selectCheckBox.click();
      browser.sleep(MID_DELAY);
      orgName= await bannerPage.orgName.getText();
      browser.sleep(MID_DELAY);
      address = await bannerPage.addressText.getText();
      browser.sleep(MID_DELAY);
      administrator =  await bannerPage.administratorText.getText();
      browser.sleep(MID_DELAY);
      await expect(bannerPage.activate_button.isDisplayed()).to.eventually.be.true;
      await bannerPage.activate_button.click();
      browser.sleep(MID_DELAY);
    });

    Then(/^I review the Organisation Details such as Organisation Name and Address$/, { timeout: 600 * 1000 }, async function () {
      await waitForElement('govuk-heading-xl');
      browser.sleep(MID_DELAY);
      await expect(bannerPage.approve_button.isDisplayed()).to.eventually.be.true;
      await expect(bannerPage.approve_button.getText())
        .to
        .eventually
        .equal('Approve activeOrg');

      console.log(orgName);
      console.log(address);
      console.log(administrator);


      browser.sleep(MID_DELAY);
      await expect(bannerPage.approveOrgName.getText())
        .to
        .eventually
        .equal(orgName);

      browser.sleep(MID_DELAY);
      await expect(bannerPage.approveAddress.getText())
        .to
        .eventually
        .equal(address);

      browser.sleep(MID_DELAY);
      await expect(bannerPage.approveAdministratorText.getText())
        .to
        .eventually
        .equal(administrator);
    });
});
