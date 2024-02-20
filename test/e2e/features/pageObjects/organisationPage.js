'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');

function OrganisationPage(){

  this.container = $('app-org-details-info')
  this.backLink = $('.govuk-back-link')

  this.subNavigations = element(by.css('.hmcts-sub-navigation'));
  this.organisationDetailsTab = element(by.xpath('//app-org-details//a[contains(text(),"Organisation details")]'));
  this.usersTab = element(by.xpath('//app-org-details//a[contains(text(),"Users")]'));

  this.statusBadge = element(by.css('.hmcts-badge'));
  
  this.h1Header = element(by.css('#content h1'));

  this.approveOptionLegend = $('.govuk-fieldset legend')
  this.approveOption = element(by.xpath(`//div//label[contains(text(),'Approve it')]/../input`))
  this.rejectOption = element(by.xpath(`//div//label[contains(text(),'Reject it')]/../input`))
  this.placeUnderreviewOption = element(by.xpath(`//div//label[contains(text(),'Place registration under review pending further investigation')]/../input`))
  this.submitButton = element(by.xpath(`//button[contains(text(),'Submit')]`))

  this.deleteOrgButton = element(by.xpath(`//button[contains(text(),'Delete organisation')]`))


  this.organisationDetailsContainer = $('.govuk-summary-list');

  this.organisationDetailsFields = ['Name', 'Address'];

  this.isSubNavigationsPresent = async function(){
    return await this.subNavigations.isPresent();
  };

  this.isOrganisationDetailsTabPresent = async function () {
    return await this.organisationDetailsTab.isPresent();
  };

  this.isUsersTabPresent = async function () {
    return await this.usersTab.isPresent();
  };

  this.getOrganisationStatus = async function () {
    return await this.statusBadge.getText();
  };

  this.clickUsersTab = async function(){
    await this.usersTab.click();
  };

  this.clickOrganisationdetaulsTab = async function () {
    await this.organisationDetailsTab.click();
  };

  this.getOrgDetailsFieldValue = async function(field, value){
    const fieldWithValue = element(by.xpath(`//div[contains(@class,'govuk-summary-list__row')]/dt[contains(text(),'${field}')]/../dd`))
    const val = await fieldWithValue.getText();
    return val;
  }

  this.validateOrganisationDetailsDisplayed = async function(){
    expect(await this.h1Header.getText()).to.equal('Organisation details');
    await browserWaits.waitForElement(this.organisationDetailsContainer);
    for (let fieldCtr = 0; fieldCtr < this.organisationDetailsFields.length; fieldCtr++){
      const fieldPresentStatus = await element(by.xpath('//dt[contains(@class,\'govuk-check-your-answers__question\') and contains(text(),' + this.organisationDetailsFields[fieldCtr]+')]'))
        .isPresent();
      expect(fieldPresentStatus).to.be.true;
    }
  };

  this.validateUsersDisplayed = async function () {
    const usersList = element(by.css('xuilib-user-list td'));
    await browserWaits.waitForElement(usersList);
    expect(await this.h1Header.getText()).to.equal('Users');
    expect(await usersList.isPresent()).to.be.true;
  };
}

module.exports = new OrganisationPage();
