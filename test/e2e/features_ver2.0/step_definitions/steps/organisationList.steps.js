'use strict';

const { When, Then } = require('cucumber');
const { MID_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const browserWaits = require('../../../support/customWaits');
const loginPage = require('../../pageObjects/loginLogoutObjects');
const organisationListPage = require('../../pageObjects/organisationListPage');

const CucumberReporter = require('../../../support/CucumberReporter');

When(/^I navigate to EUI Approve Organisation Url$/, { timeout: 600 * 1000 }, async function () {
  await browser.get(config.config.baseUrl);
  if (!process.env.TEST_URL.includes('demo')) { //Do not delete cookies for demo env.
    await browser.driver.manage()
      .deleteAllCookies();
    await browser.refresh();
  }
  const world = this;
  if ((await browser.getCurrentUrl()).startsWith('https://login.microsoftonline.com/')) {
    await loginPage.microsoftSignIn();
  }
  await browserWaits.retryForPageLoad(loginPage.emailAddress, async (message) => {
    world.attach('Retry reloading page. ' + message);
  });
  await browserWaits.waitForElement(loginPage.emailAddress);
});

Then(/^I Check the home page title appear$/, async function () {
  CucumberReporter.AddMessage('Started step');
  //await browserWaits.waitForBrowserReadyState(120);
  CucumberReporter.AddMessage('Completed LONG DELAY');
  await browserWaits.waitForElement(organisationListPage.homePageHeading);
  await expect(organisationListPage.homePageHeading.isDisplayed()).to.eventually.be.true;
});

When('I select page {int}', async function (pageNum) {
  await organisationListPage.orgTable.selectPage(pageNum);
});

When('I click first organization view link', { timeout: 600 * 1000 }, async function () {
  // await organisationListPage.waitForOrgListToDisplay();
  await organisationListPage.clickViewOnFirstOrganisation();
});

Then('I get a registration {string} confirmation', async function (decision) {
  const decisionStatement = {
    'accepted': 'Registration approved',
    'rejected': 'Registration rejected',
    'under_review': 'Registration put under review'
  };
  await browserWaits.waitForElement(organisationListPage.bannerMessageContainer);
  expect(organisationListPage.bannerMessageContainer.getText()).to.eventually.include(decisionStatement[decision]);
});

When('I search for the organisation', async function () {
  await organisationListPage.searchOrg();
  await browser.sleep(MID_DELAY);
});

Then('I can see the orgainsation listed', async function () {
  const rowContent = await organisationListPage.orgTable.getRowContent(1);
  expect(rowContent.Organisation.split('\n')[0])
    .to.equal(organisationListPage.orgDetails.Organisation.split('\n')[0]);
});

When('I select {string} tab', async function (tabName) {
  await organisationListPage.selectTab(tabName);
});
