'use strict';
const path = require('path');

const { defineSupportCode } = require('cucumber');;
const staffDetailsPage = require('../../pageObjects/staffDetailsPage');

defineSupportCode(function ({ Given, When, Then }) {

    Then('I see Staff details upload page displayed', async function () {
        expect(await staffDetailsPage.amOnPage(),"Staff details upload page not displayed").to.be.true;
    });

    When('I select file to upload Staff details', async function(){
        await staffDetailsPage.selectFile(path.resolve(__dirname,'../../../../data/Staff Data Upload Template V1.0.1.xlsx'));
    });

    When('I click upload button in Staff details upload page', async function(){
        await staffDetailsPage.clickUpload();
    });

    Then('I see Staff details upload success page', async function(){
        expect(await staffDetailsPage.isUploadProcessSuccess(),"Staff details upload success or partial success  page not displayed").to.be.true;
    });

});
