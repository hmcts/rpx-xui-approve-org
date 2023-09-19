'use strict';

const { Then } = require('@cucumber/cucumber');
const organisationListPage = require('../../pageObjects/organisationListPage');

Then('I search with organisation name and validate results', async function () {
  await organisationListPage.searchAndValidateByName();
});
