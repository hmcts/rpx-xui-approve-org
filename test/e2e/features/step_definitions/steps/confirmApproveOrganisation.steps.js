'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const organisationList = require('../../pageObjects/organisationListPage');

const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf_old.js');
const browserWaits = require('../../../support/customWaits');

async function waitForElement(el) {
  await $(`.${el}`).wait()
}

Then('I click first organization view link', async function(){
  browser.sleep(LONG_DELAY);
  // await organisationList.waitForOrgListToDisplay();
  await organisationList.clickViewOnFirstOrganisation();
});

Then('I click last organization view link', async function () {
  browser.sleep(LONG_DELAY);
  // await organisationList.waitForOrgListToDisplay();
  await organisationList.clickViewOnLastOrganisation();
});

Then('I Select the Organisation and click Activate', async function () {
  // await waitForElement(bannerPage.approveorgBanner);
  // await expect(bannerPage.approveorgBanner.isDisplayed()).to.be.true;
  // await expect(bannerPage.selectCheckBox.isDisplayed()).to.be.true;
  // await browserWaits.waitForElement(bannerPage.selectCheckBox);
  // await bannerPage.selectCheckBox.click();
  // browser.sleep(MID_DELAY);
  await browserWaits.waitForElement(bannerPage.activate_button, 60);
  await expect(await bannerPage.activate_button.isDisplayed()).to.be.true;
  await bannerPage.activate_button.click();
  browser.sleep(MID_DELAY);
});

Then('I approve the selected Organisations button',  async function () {
  // await waitForElement('govuk-heading-xl');
  await browserWaits.waitForElement(bannerPage.approve_button);
  await expect(await bannerPage.approve_button.isDisplayed()).to.be.true;
  await expect(await bannerPage.approve_button.getText())
    .to
    .equal('Confirm');
  await bannerPage.approve_button.click();
});

Then('I see the Confirmation screen of Organisations', async function () {
  await browserWaits.waitForElement(bannerPage.confirmationScreen);
  await expect(await bannerPage.confirmationScreen.isDisplayed()).to.be.true;
  await expect(await bannerPage.confirmationScreen.getText())
    .to
    .contains('Organisation approved successfully');
});

Then('I see the Confirmation screen of Deleted Organisation', async function () {
  await browserWaits.waitForElement(bannerPage.confirmationScreen);
  await expect(await bannerPage.confirmationScreen.isDisplayed()).to.be.true;
  await expect(await bannerPage.confirmationScreen.getText())
    .to
    .contains('has been deleted');
});

Then('I click to Back to Organisations link', async function () {
  await expect(await bannerPage.backtoOrganisations.isDisplayed()).to.be.true;
  await bannerPage.backtoOrganisations.click();
  await expect(await bannerPage.secondaryHeader.isDisplayed()).to.be.true;
  await expect(await bannerPage.secondaryHeader.getText())
    .to
    .equals('New registrations');
});



