'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const organisationList = require('../../pageObjects/organisationListPage');

const { defineSupportCode } = require('cucumber');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const EC = protractor.ExpectedConditions;
const browserWaits = require('../../../support/customWaits');

async function waitForElement(el) {
    await browser.wait(result => {
        return element(by.className(el)).isPresent();
    }, 600000);
}

defineSupportCode(function ({ Given, When, Then,And }) {

  Then('I click first organization view link',{ timeout: 600 * 1000 }, async function(){
    browser.sleep(LONG_DELAY);
    // await organisationList.waitForOrgListToDisplay();
    await organisationList.clickViewOnFirstOrganisation();

  });

    Then(/^I Select the Organisation and click Activate$/, async function () {
        // await waitForElement(bannerPage.approveorgBanner);
     // await expect(bannerPage.approveorgBanner.isDisplayed()).to.eventually.be.true;
     // await expect(bannerPage.selectCheckBox.isDisplayed()).to.eventually.be.true;
      // await browserWaits.waitForElement(bannerPage.selectCheckBox);
      // await bannerPage.selectCheckBox.click();
      // browser.sleep(MID_DELAY);
      await browserWaits.waitForElement(bannerPage.activate_button,60);
      await expect(bannerPage.activate_button.isDisplayed()).to.eventually.be.true;
      await bannerPage.activate_button.click();
      browser.sleep(MID_DELAY);

    });

    Then(/^I approve the selected Organisations button$/, { timeout: 600 * 1000 }, async function () {
      // await waitForElement('govuk-heading-xl');
      await browserWaits.waitForElement(bannerPage.approve_button);
      await expect(bannerPage.approve_button.isDisplayed()).to.eventually.be.true;
      await expect(bannerPage.approve_button.getText())
        .to
        .eventually
        .equal('Confirm');
      await bannerPage.approve_button.click();
    });

  Then(/^I see the Confirmation screen of Organisations$/, { timeout: 600 * 1000 }, async function () {
    await browserWaits.waitForElement(bannerPage.confirmationScreen);
    await expect(bannerPage.confirmationScreen.isDisplayed()).to.eventually.be.true;
    await expect(bannerPage.confirmationScreen.getText())
      .to
      .eventually
      .contains('Organisation approved successfully');
  });

  Then(/^I click to Back to Organisations link$/, { timeout: 600 * 1000 }, async function () {
    await expect(bannerPage.backtoOrganisations.isDisplayed()).to.eventually.be.true;
    await bannerPage.backtoOrganisations.click();
    await browserWaits.waitForElement(element(by.css('.hmcts-banner')));
    await expect(bannerPage.secondaryHeader.getText())
      .to
      .eventually
      .equals('Organisations pending activation');
  });

});
