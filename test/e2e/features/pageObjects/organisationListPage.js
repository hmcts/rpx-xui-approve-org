'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');
const reportLogger = require('../../../codeceptCommon/reportLogger');

function OrganisationListPage() {
  this.rows = element.all(by.css('.govuk-table tr'));

  this.searchInput = element(by.css('#search'));
  this.searchBtn = element(by.xpath('//button[@type = \'submit\' and contains(text(),\'Search\')]'));


  this.newRegistrationsContainer = $('app-pending-overview-component')
  this.newPBAContainer = $('app-pending-overview-component')
  this.activeOrganisatiosnContainer = $('app-prd-org-overview-component')

  this.containerHeader = $('.govuk-tabs h2.govuk-heading-l')

  this.banner = $('.hmcts-banner__message')

  this.getSubNavigationTabElement = function(tabLabel){
    return element(by.xpath(`//ul[contains(@class,'govuk-tabs__list')]//a[contains(@class,'govuk-tabs__tab')][contains(text(),'${tabLabel}')]`))
  }

  this.clickSubNavigation = async function(tabLabel){
    const e = this.getSubNavigationTabElement(tabLabel);
    await e.click();
  }

  this.getOrgCount = async function(){
    await this.waitForOrgListToDisplay();
    return (await this.rows.count()) - 1;
  };

  this.searchAndValidateByName = async function(){
    await this.waitForOrgListToDisplay();
    // const searchWithName = await this.getOrgNameFromRow(1);
    const searchWithName = 'API Test Org';
    await this.searchInput.sendKeys(searchWithName);
    await this.searchBtn.click();
    browser.sleep(2000);
    await this.validateSearchResultsByName(searchWithName);
  };

  this.searchOrg = async function (searchInput) {
    await this.waitForOrgListToDisplay();
    // const searchWithName = await this.getOrgNameFromRow(1);
    await this.searchInput.sendKeys(searchInput);
    await this.searchBtn.click();
  };

  this.validateSearchResults = async function (searchField,searchInput) {
    await this.waitForOrgListToDisplay();
    const organisations = await this.getOrganisations()
    // const searchWithName = await this.getOrgNameFromRow(1);
    reportLogger.AddMessage(JSON.stringify(organisations, null,2))
    const orgsFieldValues = organisations.map(org => org[searchField])
    for (const value of orgsFieldValues){
      reportLogger.AddMessage(`${value} includes ${searchInput}`)
      expect(value.toLowerCase()).includes(searchInput.toLowerCase());
    }
  };

  this.getOrgNameFromRow = async function(rowNum){
    const NameFieldText = await this.rows.get(rowNum).element(by.css('td')).getText();
    const orgUniqueId = await this.rows.get(rowNum).element(by.css('td span')).getText();
    return NameFieldText.replace(orgUniqueId, '');
  };

  this.validateSearchResultsByName = async function(name){
    const rowsCount = await this.getOrgCount();
    for (let row = 0; row < rowsCount; row++){
      const orgName = await this.getOrgNameFromRow(row+1);
      assert(orgName === name, 'Search result with name does not match. Expected: '+name+' Found: '+orgName);
      if (rowsCount > 20){
        break;
      }
    }
  };

  this.getOrganisations = async function(){
    const organisationsList = []
    const rows = $('table.govuk-table tr.govuk-table__row.govuk-radios')
    const rowsCount = await rows.count();

    for(let rowCtr = 0; rowCtr < rowsCount; rowCtr++){
      const org = {}
      const row = await rows.get(rowCtr);
      org['Organisation'] = await row.$('td:nth-of-type(1)').getText();
      org['Address'] = await row.$('td:nth-of-type(2)').getText();
      org['Administrator'] = await row.$('td:nth-of-type(3)').getText();
      org['Date received'] = await row.$('td:nth-of-type(4)').getText();
      org['Status'] = await row.$('td:nth-of-type(5)').getText();

      organisationsList.push(org)

    }
    return organisationsList;
  }

  this.waitForOrgListToDisplay = async function() {
    await browserWaits.waitForSpinnerToDissappear()
    await browserWaits.waitForElement(this.rows.get(0));
  };

  this.clickViewOnFirstOrganisation = async function () {
    const viewLink = element(by.xpath(`//table//a[contains(text(),'View')]`))
    reportLogger.AddMessage(await viewLink.getAttribute('href'))
    await viewLink.click();
  };

  this.clickViewOnLastOrganisation = async function () {
    const viewLinks = element.all(by.xpath(`//table//a[contains(text(),'View')]`));
    const linksCount = await viewLinks.count()
    const lastLink = viewLinks.get(linksCount - 1)
    reportLogger.AddMessage(await lastLink.getAttribute('href'))
    await lastLink.click();
  };

  this.waitForSpinnerToDisappear = async function(){
    const spinner = $('div.spinner-inner-container .spinner')
    let spinnerDisplayStatus = await spinner.isDisplayed();
    do{
      await browser.sleep(3)
      spinnerDisplayStatus = await spinner.isDisplayed();
    } while (spinnerDisplayStatus)

  }
}

module.exports = new OrganisationListPage();
