'use strict';

const { When, Then } = require('cucumber');
const browserWaits = require('../../../support/customWaits');
const organisationDetails = require('../../pageObjects/organisationDetailsPage');
const CreateOrganisationObject = require('../../pageObjects/createOrganisationObjects');
const ChangePbaPage = require('../../pageObjects/changePbaPage');


Then('I see {string} on organisation details page', { timeout: 600 * 1000 }, async function (orgDetailsHeader) {
  await browserWaits.waitForElement(organisationDetails.heading);
  expect(organisationDetails.heading.getText()).to.eventually.equal(orgDetailsHeader);
  const orgDetailsKeys = [
    'Name',
    'SRA ID',
    'Administrator',
    'Address',
    'DX',
    'PBA number'
  ];
  const orgDetails = await organisationDetails.getOrgDetails();
  expect(Object.keys(orgDetails)).to.include.all.members(orgDetailsKeys);
});

When(/^I select approve organisation$/, async function () {
  await organisationDetails.approveOrg();
});

When(/^I select reject organisation$/, async function () {
  await organisationDetails.rejectOrg();
});

When(/^I select place registration under review$/, async function () {
  await organisationDetails.placeOrgUnderReview();
});

Then('I see the organisation state as {string}', async function (orgState) {
  expect(organisationDetails.identityBar.getText()).to.eventually.include(orgState);
});

Then('I validate PBA details for PBA {int}', async function (count) {
  const orgDetails = await organisationDetails.getOrgDetails();
  const expectedOrgData = CreateOrganisationObject.getOrgData();
  expect(orgDetails['PBA number']).to.include(expectedOrgData['pba_' + count]);
});

Then('I navigate to change PBA page for PBA {int}', async function(count) {
  await organisationDetails.clickChangePba(count);
});

