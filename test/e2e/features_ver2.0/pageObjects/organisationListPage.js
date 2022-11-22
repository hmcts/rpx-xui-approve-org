'use strict';

const { browser } = require('protractor');
const { MID_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');

function OrganisationListPage() {

    this.homePageHeading = $('#main-content h1');
    this.bannerMessageContainer = element(by.css('.hmcts-banner__message'));
    this.orgTable = require('./common/orgTable');
    this.searchBar = require('./common/searchBar');
    this.rowHeaders = $$('.govuk-table tr');
    this.rows = $$('.govuk-table tr');
    this.tableHeaders = $$('.govuk-table__header');
    this.viewOrg = element.all(by.linkText('View')).first();
    this.searchInput = element(by.css("#search"));
    this.searchBtn = element(by.xpath("//button[@type = 'submit' and contains(text(),'Search')]"));
    this.orgTabsLocator = '.govuk-tabs__tab';

    this.orgDetails = {};

    this.waitForOrgListToDisplay = async function () {
        await browserWaits.waitForElement(this.rows.get(0));
    };

    this.clickViewOnFirstOrganisation = async function () {
        this.orgDetails = await this.orgTable.getRowContent(1);
        await browserWaits.waitForElementClickable(this.viewOrg);
        await this.viewOrg.click();
    };

    this.verifyRowContent = async function () {
        let expectedOrgDetails = await this.orgTable.getRowContent(1);
        return [this.orgDetails, expectedOrgDetails];
    };

    this.selectTab = async function (tabHeading) {
        let tabElement = element(by.cssContainingText(this.orgTabsLocator, tabHeading));
        await browser.sleep(MID_DELAY);
        await browserWaits.waitForElementClickable(tabElement);
        await tabElement.click();
        await browser.sleep(MID_DELAY);
    };

    this.searchOrg = async function () {
        await this.searchBar.searchField.sendKeys(this.orgDetails['Organisation'].split('\n')[0]);
        await browserWaits.waitForElementClickable(this.searchBar.searchButton);
        await this.searchBar.searchButton.click();
    };

}

module.exports = new OrganisationListPage;
