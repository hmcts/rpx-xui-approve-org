'use strict';

const { When } = require('cucumber');
const { SHORT_DELAY } = require('../../../support/constants');
const CreateOrganisationObject = require('../../pageObjects/createOrganisationObjects');
const changePbaPage = require('../../pageObjects/changePbaPage');

When('I am on change PBA page', async function () {
  expect(await changePbaPage.getHeading()).to.equal('Organisation payment by account (PBA) number');
});

When('I add PBA {int}', async function (count) {
  const randomPba = Math.floor(Math.random() * 9000000) + 1000000;
  const pbaVal = 'PBA' + randomPba;
  await changePbaPage.addPba(count, pbaVal);
  await browser.sleep(SHORT_DELAY);
  await changePbaPage.submitPage();
  CreateOrganisationObject.storeOrgData('pba_' + count, pbaVal);
});

When('I change PBA {int}', async function (count) {
  const randomPba = Math.floor(Math.random() * 9000000) + 1000000;
  const pbaVal = 'PBA' + randomPba;
  await changePbaPage.enterPba(count, pbaVal);
  await changePbaPage.submitPage();
  CreateOrganisationObject.storeOrgData('pba_' + count, pbaVal);
});

