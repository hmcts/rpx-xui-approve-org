'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');

function OrganisationListPage() {

    this.rows = element.all(by.css(".govuk-table tr"));

    this.searchInput = element(by.css("#search"));
    this.searchBtn = element(by.xpath("//button[@type = 'submit' and contains(text(),'Search')]"));


    this.getOrgCount = async function(){
        await this.waitForOrgListToDisplay ();
        return (await this.rows.count()) - 1;
    };

    this.searchAndValidateByName = async function(){
        await this.waitForOrgListToDisplay();
        // const searchWithName = await this.getOrgNameFromRow(1);
        const searchWithName = 'Auto';
        await this.searchInput.sendKeys(searchWithName);
        await this.searchBtn .click();
        browser.sleep(2000);
        // await this.validateSearchResultsByName(searchWithName);

    };

    this.getOrgNameFromRow = async function(rowNum){
        const NameFieldText = await this.rows.get(rowNum).element(by.css('td')).getText();
        const orgUniqueId = await this.rows.get(rowNum).element(by.css('td span')).getText();
        return NameFieldText.replace(orgUniqueId,'');
    }

    this.validateSearchResultsByName = async function(name){
        const rowsCount = await this.getOrgCount();
        for(var row = 0; row < rowsCount; row++){
            const orgName = await this.getOrgNameFromRow(row+1);
            assert(orgName === name, "Search result with name does not match. Expected: "+name+" Found: "+orgName);
            if (rowsCount > 20){
                break;
           }
        }
    };

    this.waitForOrgListToDisplay = async function()
    {
        await browserWaits.waitForElement(this.rows.get(0));
    }

    this.clickViewOnFirstOrganisation = async function () {
        const rowText = await this.rows.get(1).getText();
        const viewLink = await this.rows.get(1).element(by.xpath("//a[contains(text(),'View')]"));
        await browser.executeScript('arguments[0].scrollIntoView()',viewLink); 
        await viewLink.click();
        await browserWaits.waitForElement(element(by.xpath('//h1[contains(text(),"Organisation details")]')));
    };




}

module.exports = new OrganisationListPage;
