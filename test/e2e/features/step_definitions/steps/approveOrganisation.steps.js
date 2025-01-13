'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf_old.js');
const browserWaits = require('../../../support/customWaits');
const { browser } = require('protractor');
const loginPage = require('../../pageObjects/loginLogoutObjects');
const { When, Then } = require('@cucumber/cucumber');
const CucumberReporter = require('../../../support/CucumberReporter');

async function waitForElement(el) {
  await browser.wait((result) => {
    return element(by.className(el)).isPresent();
  }, 600000);
}

// Given(function () {
//   // Given step implementation
// });

When('I navigate to EUI Approve Organisation Url', async function () {
  const world = this;
  console.log('I navigate to EUI Approve Organisation Url ;;;;;;;;;;;;;;');
  await browser.driver.manage().deleteAllCookies();
  console.log('deleted the browser cookies;;;;;;;;;;;;;;;;;;');
  await browser.get(config.config.baseUrl);
  console.log('got base url ;;;;;;;;;;;;;;;;;;;;;;')
  // await browserWaits.waitForElement(loginPage.emailAddress);
  // await browserWaits.waitForElement(loginPage.emailAddress, LONG_DELAY, 'Failed to find email address field');
  await browserWaits.retryWithAction(loginPage.emailAddress, async function (message) {
    const stream = await browser.takeScreenshot();
    const decodedImage = new Buffer(stream.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
    world.attach(decodedImage, 'image/png');
    await browser.get(config.config.baseUrl);
  });
  console.log('called retryWithAction ;;;;;;;;;;;;;');
  await browserWaits.waitForElement2(loginPage.emailAddress, LONG_DELAY, 'IDAM login page Email Address input not present');
  console.log('called waitForElement ;;;;;;;;;;;;;');
});

Then('I Check the active Organisation banner appear', async function () {
  CucumberReporter.AddMessage('Started step');
  await browserWaits.waitForBrowserReadyState(120);
  await browser.sleep(LONG_DELAY);
  CucumberReporter.AddMessage('Completed LONG DALAY');

  await browserWaits.waitForElement(bannerPage.approveorgBanner);
  await expect(await bannerPage.approveorgBanner.isDisplayed()).to.be.true;
});

// Then('I Verify the Check Now Link', async function () {
//   browser.sleep(AMAZING_DELAY);
//   await browserWaits.waitForElement(bannerPage.checkNow);
//   await expect(bannerPage.checkNow.isDisplayed()).to.be.true;
//   await expect(bannerPage.checkNow.getText())
//     .to
//     .eventually
//     .contains('Check now.');
// });

Then('I Verify the Active Organisations Tab', async function () {
  browser.sleep(AMAZING_DELAY);
  await browserWaits.waitForElement(bannerPage.activeOrgsTab);
  await expect(await bannerPage.activeOrgsTab.isDisplayed()).to.be.true;
  await expect(await bannerPage.activeOrgsTab.getText())
    .to
    .contains('Active organisations');
});

// Then('I click on Check Now Link to redirect to Active Organisations page', async function () {
//   browser.sleep(LONG_DELAY);
//   await browserWaits.waitForElement(bannerPage.checkNow);
//   await expect(bannerPage.checkNow.isDisplayed()).to.be.true;
//   await bannerPage.checkNow.click();
//   await browserWaits.waitForElement(bannerPage.secondaryHeader);
//   await waitForElement('govuk-heading-l');
//   await expect(bannerPage.secondaryHeader.getText())
//     .to
//     .eventually
//     .equals('Active organisations');
// });

Then('I click on Active Organisations Tab to redirect to Active Organisations page', async function () {
  browser.sleep(LONG_DELAY);
  await browserWaits.waitForElement(bannerPage.activeOrgsTab);
  await expect(await bannerPage.activeOrgsTab.isDisplayed()).to.be.true;
  await bannerPage.activeOrgsTab.click();
  await browserWaits.waitForElement(bannerPage.secondaryHeader);
  await waitForElement('govuk-heading-l');
  await expect(await bannerPage.secondaryHeader.getText())
    .to
    .equals('Active organisations');
});

Then('I delete the organisation Active Organisation', async function () {
  browser.sleep(MID_DELAY);
  await expect(await bannerPage.viewOrg.isDisplayed()).to.be.true;
  await bannerPage.viewOrg.click();
  browser.sleep(MID_DELAY);

  await expect(await bannerPage.deleteOrganisation.isDisplayed()).to.be.true;
  await bannerPage.deleteOrganisation.click();
  browser.sleep(SHORT_DELAY);
  await expect(await bannerPage.deleteOrganisationWarning.isDisplayed()).to.be.true;
  await bannerPage.deleteOrganisationWarning.click();
});



