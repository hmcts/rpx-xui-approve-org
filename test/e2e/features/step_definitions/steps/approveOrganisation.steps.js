'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const { When, Then } = require('@cucumber/cucumber');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const EC = protractor.ExpectedConditions;
const browserWaits = require('../../../support/customWaits');
const loginPage = require('../../pageObjects/loginLogoutObjects');

const CucumberReporter = require('../../../support/CucumberReporter');

async function waitForElement(el) {
  await browser.wait((result) => {
    return element(by.className(el)).isPresent();
  }, 600000);
}

// Given(function () {
//   // Given step implementation
// });

When(/^I navigate to EUI Approve Organisation Url$/, { timeout: 600 * 1000 }, async function () {
  await browser.get(config.config.baseUrl);
  if (!process.env.TEST_URL.includes('demo')){ //Do not delete cookies for demo env.
    await browser.driver.manage()
      .deleteAllCookies();
    await browser.refresh();
  }
  const world = this;
  if ((await browser.getCurrentUrl()).startsWith('https://login.microsoftonline.com/')) {
    await loginPage.microsoftSignIn();
  }
  await browserWaits.retryForPageLoad(loginPage.emailAddress, async (message) => {
    world.attach('Retry reloading page. '+message);
  });
  await browserWaits.waitForElement(loginPage.emailAddress);
});

Then(/^I Check the active Organisation banner appear$/, async function () {
  CucumberReporter.AddMessage('Started step');
  await browserWaits.waitForBrowserReadyState(120);
  await browser.sleep(LONG_DELAY);
  CucumberReporter.AddMessage('Completed LONG DALAY');

  await browserWaits.waitForElement(bannerPage.approveorgBanner);
  await expect(bannerPage.approveorgBanner.isDisplayed()).to.eventually.be.true;
});

// Then(/^I Verify the Check Now Link$/, async function () {
//   browser.sleep(AMAZING_DELAY);
//   await browserWaits.waitForElement(bannerPage.checkNow);
//   await expect(bannerPage.checkNow.isDisplayed()).to.eventually.be.true;
//   await expect(bannerPage.checkNow.getText())
//     .to
//     .eventually
//     .contains('Check now.');
// });

Then(/^I Verify the Active Organisations Tab$/, async function () {
  browser.sleep(AMAZING_DELAY);
  await browserWaits.waitForElement(bannerPage.activeOrgsTab);
  await expect(bannerPage.activeOrgsTab.isDisplayed()).to.eventually.be.true;
  await expect(bannerPage.activeOrgsTab.getText())
    .to
    .eventually
    .contains('Active organisations');
});

// Then(/^I click on Check Now Link to redirect to Active Organisations page$/, async function () {
//   browser.sleep(LONG_DELAY);
//   await browserWaits.waitForElement(bannerPage.checkNow);
//   await expect(bannerPage.checkNow.isDisplayed()).to.eventually.be.true;
//   await bannerPage.checkNow.click();
//   await browserWaits.waitForElement(bannerPage.secondaryHeader);
//   await waitForElement('govuk-heading-l');
//   await expect(bannerPage.secondaryHeader.getText())
//     .to
//     .eventually
//     .equals('Active organisations');
// });

Then(/^I click on Active Organisations Tab to redirect to Active Organisations page$/, async function () {
  browser.sleep(LONG_DELAY);
  await browserWaits.waitForElement(bannerPage.activeOrgsTab);
  await expect(bannerPage.activeOrgsTab.isDisplayed()).to.eventually.be.true;
  await bannerPage.activeOrgsTab.click();
  await browserWaits.waitForElement(bannerPage.secondaryHeader);
  await waitForElement('govuk-heading-l');
  await expect(bannerPage.secondaryHeader.getText())
    .to
    .eventually
    .equals('Active organisations');
});

Then(/^I delete the organisation Active Organisation$/, async function () {
  browser.sleep(MID_DELAY);
  await expect(bannerPage.viewOrg.isDisplayed()).to.eventually.be.true;
  await bannerPage.viewOrg.click();
  browser.sleep(MID_DELAY);

  await expect(bannerPage.deleteOrganisation.isDisplayed()).to.eventually.be.true;
  await bannerPage.deleteOrganisation.click();
  browser.sleep(SHORT_DELAY);
  await expect(bannerPage.deleteOrganisationWarning.isDisplayed()).to.eventually.be.true;
  await bannerPage.deleteOrganisationWarning.click();
});
