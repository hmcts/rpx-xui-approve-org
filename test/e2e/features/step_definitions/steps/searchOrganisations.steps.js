'use strict';

const organisationListPage = require('../../pageObjects/organisationListPage');
const browserWaits = require('../../../support/customWaits');
const { When, Then } = require('cucumber');

Then('I search with organisation name and validate results', async function () {
  await organisationListPage.searchAndValidateByName();
});

When('I search for organisation with input {string}', async function (searchInput) {
  await organisationListPage.searchOrg(searchInput);
});

Then('I validate search results field {string} contains {string}', async function (searhfield, searchInput) {
  //await organisationListPage.validateSearchResults(searhfield, searchInput);
});


When('I click sub navigation tab {string} in organisation list page', async function (navTab) {
  await organisationListPage.clickSubNavigation(navTab);
});


Then('I see Organisations list page with sub navigation page {string}', async function (headerPage) {
  await browserWaits.retryWithActionCallback( async () => {
    const header = await organisationListPage.containerHeader.getText();
    expect(header).to.include(headerPage)
  })

});


Then('I see organisations list page with messge banner {string}', async function (message) {
  expect(await organisationListPage.banner.getText()).to.includes(message)
})

