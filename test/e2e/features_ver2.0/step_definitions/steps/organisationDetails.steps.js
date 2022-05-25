'use strict';

const { defineSupportCode } = require('cucumber');
const browserWaits = require('../../../support/customWaits');
const organisationDetails = require('../../pageObjects/organisationDetailsPage');

defineSupportCode(function ({ Given, When, Then, And }) {

  Then('I see {string} on organisation details page', { timeout: 600 * 1000 }, async function (orgDetailsHeader) {
    await browserWaits.waitForElement(organisationDetails.heading);
    expect(organisationDetails.heading.getText()).to.eventually.equal(orgDetailsHeader);
    let orgDetailsKeys = [
      'Name',
      'SRA ID',
      'Administrator',
      'Address',
      'DX',
      'PBA number'
    ];
    let orgDetails = await organisationDetails.getOrgDetails();
    expect(Object.keys(orgDetails)).to.include.all.members(orgDetailsKeys);

  });

  When(/^I select approve organisation$/, async function () {
    await organisationDetails.approveOrg();
  });

  When(/^I select reject organisation$/, async function () {
    await organisationDetails.rejectOrg();
  });

  Then('I see the organisation state as {string}', async function (orgState) {
    expect(organisationDetails.identityBar.getText()).to.eventually.include(orgState);
  });

});
