'use strict';
const path = require('path');

const { When, Then } = require('cucumber');
const staffDetailsPage = require('../../pageObjects/staffDetailsPage');

Then('I see Staff details upload page displayed', async function () {
  expect(await staffDetailsPage.amOnPage(), 'Staff details upload page not displayed').to.be.true;
});

When('I select file to upload Staff details', async function(){
  await staffDetailsPage.selectFile(path.resolve(__dirname, '../../../../data/Staff Data Upload Template V1.14.xlsx'));
});

When('I click upload button in Staff details upload page', async function(){
  await staffDetailsPage.clickUpload();
});

Then('I see Staff details upload success process page', async function(){
  expect(await staffDetailsPage.isUploadProcessSuccess(), 'Staff details upload success or partial success  page not displayed').to.be.true;
});

Then('I see Staff details upload success page', async function () {
  expect(await staffDetailsPage.isUploadSuccessPageDisplayed(), 'Staff details upload success  page not displayed').to.be.true;
});

Then('I see Staff details upload partial success page', async function () {
  expect(await staffDetailsPage.isPartialSuccessPageDisplayed(), 'Staff details  partial success  page not displayed').to.be.true;
});

Then('I see Staff details service down page', async function () {
  expect(await staffDetailsPage.isServiceDownMessageDisplayed(), 'service down message  page not displayed').to.be.true;
});

Then('I see Staff details unauthorised error page', async function () {
  expect(await staffDetailsPage.isUnauthorisedMessageDisplayed(), 'Unauthorised error message  page not displayed').to.be.true;
});

Then('I see error message banner in staff details page', async function(){
  expect(await staffDetailsPage.isErrorMessageBannerDisplayed(), 'Error message banner not displayed').to.be.true;
});

Then('I see staff details banner with error message {string}', async function(errorMessage){
  const errorMessages = await staffDetailsPage.getInputFileErrorMessage();
  let isexpectedErrorMessageStringDisplayed = false;
  for (const error of errorMessages){
    isexpectedErrorMessageStringDisplayed = error.includes(errorMessage);
  }
  expect(isexpectedErrorMessageStringDisplayed, 'Error message banner not displayed ' + JSON.stringify(errorMessages)).to.be.true;
});

