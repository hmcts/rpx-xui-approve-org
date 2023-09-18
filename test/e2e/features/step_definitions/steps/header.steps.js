'use strict';

const { When, Then } = require('cucumber');
const headerPage = require('../../pageObjects/headerPage');

When('I click navigation tab Staff details', async function () {
  await headerPage.clickTab('Staff details');
});

When('I click navigation tab Organisations', async function () {
  await headerPage.clickTab('Organisations');
});

Then('I see primary navigation tab {string} in header', async function (headerlabel) {
  const tabsDisplayed = await headerPage.getTabsDisplayed();
  expect(tabsDisplayed.includes(headerlabel), headerlabel + ' tab is not present ' + JSON.stringify(tabsDisplayed)).to.be.true;
});

Then('I do not see primary navigation tab {string} in header', async function (headerlabel) {
  const tabsDisplayed = await headerPage.getTabsDisplayed();
  expect(tabsDisplayed.includes(headerlabel), headerlabel + ' tab is not expected to present' + JSON.stringify(tabsDisplayed)).to.be.false;
});
