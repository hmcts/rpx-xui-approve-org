'use strict';

const { defineSupportCode } = require('cucumber');;
const organisationListPage = require('../../pageObjects/organisationListPage');

defineSupportCode(function ({ Given, When, Then }) {

    Then('I search with organisation name and validate results', async function () {
        await organisationListPage.searchAndValidateByName(); 
    });

});
