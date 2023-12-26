'use strict';
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const browserWaits = require('../../../support/customWaits');
const organisationPage = require('../../pageObjects/organisationPage');
const decisionpage = require('../../pageObjects/decisionConfirmPage')

Then('I am on organisation page', async function () {
  await browserWaits.waitForElement(organisationPage.statusBadge);
});

Then('I see sub navigation tabs displayed', async function () {
  expect(await organisationPage.isSubNavigationsPresent()).to.be.true;
});

Then('I see sub navigation tabs not displayed', async function () {
  expect(await organisationPage.isSubNavigationsPresent()).to.be.false;
});

Then('I see sub navigation tab {string} displayed', async function (tabText) {
  if (tabText.includes('Users')){
    expect(await organisationPage.isUsersTabPresent()).to.be.true;
  } else if (tabText.includes('Organisation')){
    expect(await organisationPage.isOrganisationDetailsTabPresent()).to.be.true;
  } else {
    throw new Error('Unknow Tab text provided : '+tabText);
  }
});

Then('I see organisation status is {string}', async function (status) {
  expect(await organisationPage.getOrganisationStatus()).to.equal(status);
});

Then('I see organisation details displayed', async function () {
  await organisationPage.validateOrganisationDetailsDisplayed();
});

Then('I see users details displayed', async function () {
  await organisationPage.validateUsersDisplayed();
});

Then('I click organisation details tab', async function () {
  await organisationPage.clickOrganisationdetaulsTab();
});

Then('I click users details tab', async function () {
  await organisationPage.clickUsersTab();
});

Then('I see organisation details page with registration status {string}' , async function(status){
  await browserWaits.waitForElement(organisationPage.organisationDetailsContainer) 
  expect(await organisationPage.getOrganisationStatus()).to.includes(status)
})

Then('I validate pending organisation details page', async function(){
  await browserWaits.retryWithActionCallback(async () => {
    expect(await organisationPage.getOrganisationStatus()).to.includes('PENDING')
    expect(await organisationPage.approveOptionLegend.isDisplayed()).to.be.true
    expect(await organisationPage.approveOptionLegend.getText()).to.include('')
    expect(await organisationPage.approveOption.isDisplayed()).to.be.true
    expect(await organisationPage.rejectOption.isDisplayed()).to.be.true
    expect(await organisationPage.placeUnderreviewOption.isDisplayed()).to.be.true
    expect(await organisationPage.submitButton.isDisplayed()).to.be.true
  })
  
})

When('I select option {string} for pending organisation and submit', async function(option){
  switch(option){
    case 'Approve it':
      await organisationPage.approveOption.click()
      break;
    case 'Reject it':
      await organisationPage.rejectOption.click()
      break;
    case 'Place registration under review pending further investigation':
      await organisationPage.placeUnderreviewOption.click()
      break;
    default:
      throw Error(`Unknown option ${option}`)
  }
  await organisationPage.submitButton.click()
  
})

Then('I see pending organisation decision {string} confirm page', async function(decision){
  await browserWaits.waitForElement(decisionpage.header)
  expect(await decisionpage.header.isDisplayed(),'Page with expected header text not displayed').to.be.true
  expect(await decisionpage.decision.getText(), 'Decision not matching expected').to.includes(decision)
})

When('I click confirm in pending organisation decision confirm page', async function(){
  await decisionpage.confirmButton.click()
});

Then('I validate active organisation details page displayed', async function(){
  expect(await organisationPage.subNavigations.isDisplayed(),'Subnavigations not displayed').to.be.true
  expect(await organisationPage.statusBadge.getText()).to.includes('ACTIVE')
})

When('I click sub navigation tab {string} in organisation details page', async function (tabLabel) {
  if (tabLabel.includes('Organisation details')){
    await organisationPage.organisationDetailsTab.click();
  } else if (tabLabel.includes('Users')) {
    await organisationPage.usersTab.click();
  }
});

Then('I validate organisation details page displayed with header {string}', async function (header) {
  expect(await organisationPage.h1Header.getText(), 'Header did not match expected').to.includes(header)
})

Then('I validate organisation details page sub navigation tabs not displayed', async function (header) {
  expect(await organisationPage.subNavigations.isDisplayed(), 'Subnavigations displayed').to.be.false
})

When('I click delete organisation button in organisation details page', async function(){
  await organisationPage.deleteOrgButton.click()
})

When('I click Delete organisation button organisation decision confirm page', async function(){
  await organisationPage.deleteOrgButton.click()
})

Then('I see confirmation page with message containing {string}' , async function(message){
  expect(await $('.govuk-panel--confirmation').getText()).to.includes(message)
})