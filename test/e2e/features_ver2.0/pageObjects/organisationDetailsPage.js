'use strict';

const browserWaits = require('../../support/customWaits');

function OrganisationDetailsPage() {

    this.heading = $('#content app-org-details-info h1');
    this.identityBar = $('.hmcts-identity-bar__title');
    this.orgDetailsKeys = $$('.govuk-summary-list__key');
    this.orgDetailsValues = $$('.govuk-summary-list__value');
    this.orgDetailsActions = $$('.govuk-summary-list__actions');
    this.pbaPageLinks = $$('[href^="/change\/pba"]'); //element(by.partialLinkText("/change/pba"));
    this.approveOrgOption = element(by.id('reason-0'));
    this.submitButton = element(by.xpath('//button[contains(text(),"Submit")]'));

    this.getOrgDetails = async function () {
        let details = {};
        await browserWaits.waitForElement(this.orgDetailsKeys.last());
        let orgKeys = await this.orgDetailsKeys.getText();
        let orgValues = await this.orgDetailsValues.getText();
        orgKeys.forEach((orgKey, index) => {
            if (orgKey === 'PBA number' || orgKey === 'Name on Liberata account') {
                details.hasOwnProperty(orgKey) ? details[orgKey].push(orgValues[index]) : details[orgKey] = [orgValues[index]];
            }
            else {
                details[orgKey] = orgValues[index];
            }
        });
        return details;
    };

    this.approveOrg = async function () {
        await this.approveOrgOption.click();
        await this.submitButton.click();
    };

    this.clickChangePba = async function(count){
        let elementLink = await this.pbaPageLinks.get(count - 1);
        await browserWaits.waitForElementClickable(elementLink);
        await browser.sleep(2000);
        await elementLink.click();
    };

}

module.exports = new OrganisationDetailsPage;
