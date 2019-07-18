'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const { defineSupportCode } = require('cucumber');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const EC = protractor.ExpectedConditions;

async function waitForElement(el) {
    await browser.wait(result => {
        return element(by.className(el)).isPresent();
    }, 600000);
}

defineSupportCode(function ({ Given, When, Then }) {

    When(/^I navigate to EUI Approve Organisation Url$/, { timeout: 600 * 1000 }, async function () {
        await browser.get(config.config.baseUrl) ;
        await browser.driver.manage()
            .deleteAllCookies();
        await browser.refresh();
        browser.sleep(AMAZING_DELAY);
    });

    Then(/^I Check the pending Organisation banner appear$/, async function () {
        // await waitForElement(bannerPage.approveorgBanner);
        await expect(bannerPage.approveorgBanner.isDisplayed()).to.eventually.be.true;
    });

    Then(/^I Verify the Text on Banner$/, { timeout: 600 * 1000 }, async function () {
      await expect(bannerPage.bannerText.isDisplayed()).to.eventually.be.true;
      await expect(bannerPage.bannerText.getText())
        .to
        .eventually
        .contains('organisations are pending activation.');
    });

  Then(/^I Verify the Check Now Link$/, { timeout: 600 * 1000 }, async function () {
    await expect(bannerPage.checkNow.isDisplayed()).to.eventually.be.true;
    await expect(bannerPage.checkNow.getText())
      .to
      .eventually
      .contains('Check now.');
  });

  Then(/^I click on Check Now Link to redirect to Organisations Pending Activation page$/, { timeout: 600 * 1000 }, async function () {
    await expect(bannerPage.checkNow.isDisplayed()).to.eventually.be.true;
    await bannerPage.checkNow.click();
    browser.sleep(MID_DELAY);
    await waitForElement('govuk-heading-xl');
    await expect(bannerPage.pendingOrganisationText.getText())
      .to
      .eventually
      .equals('Organisations pending activation');
  });

});
