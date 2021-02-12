'use strict';

const { defineSupportCode } = require('cucumber');;
const headerPage = require('../../pageObjects/headerPage');

defineSupportCode(function ({ Given, When, Then }) {

    When('I click navigation tab Staff details', async function () {
        await headerPage.clickTab("Staff details");
    });

    When('I click navigation tab Organisations', async function () {
        await headerPage.clickTab("Organisations");
    });


});
