'use strict';

const bannerPage = require('../../pageObjects/approveOrganisationObjects');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf_old.js');
const { Then } = require('@cucumber/cucumber');
let address = '';
let administrator = ''; let orgName = '';

async function waitForElement(el) {
  await browser.wait((result) => {
    return element(by.className(el)).isPresent();
  }, 600000);
}

Then('I Select the Organisation and get the details and click Activate', async function () {
  await bannerPage.selectCheckBox.click();
  browser.sleep(MID_DELAY);
  orgName= await bannerPage.orgName.getText();
  browser.sleep(MID_DELAY);
  address = await bannerPage.addressText.getText();
  browser.sleep(MID_DELAY);
  administrator = await bannerPage.administratorText.getText();
  browser.sleep(MID_DELAY);
  await expect(await bannerPage.activate_button.isDisplayed()).to.be.true;
  await bannerPage.activate_button.click();
  browser.sleep(MID_DELAY);
});

Then('I review the Organisation Details such as Organisation Name and Address', async function () {
  await waitForElement('govuk-heading-xl');
  browser.sleep(MID_DELAY);
  await expect(await bannerPage.approve_button.isDisplayed()).to.be.true;
  await expect(await bannerPage.approve_button.getText())
    .to
    .eventually
    .equal('Approve organisatons');

  console.log(orgName);
  console.log(address);
  console.log(administrator);

  browser.sleep(MID_DELAY);
  await expect(await bannerPage.approveOrgName.getText())
    .to
    .equal(orgName);

  browser.sleep(MID_DELAY);
  await expect(await bannerPage.approveAddress.getText())
    .to
    .equal(address);

  browser.sleep(MID_DELAY);
  await expect(await bannerPage.approveAdministratorText.getText())
    .to
    .equal(administrator);
});

