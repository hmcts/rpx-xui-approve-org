'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');


function OrganisationPage(){

    this.statusBadge = element(by.css('.hmcts-badge'));
    this.subNavigations = element(by.css('.hmcts-sub-navigation'));
    this.organisationDetailsTab = this.subNavigations.element(by.xpath('//a[contains(text(),"Organisation")]'));
    this.usersTab = this.subNavigations.element(by.xpath('//a[contains(text(),"Users")]'));
    this.h1Header = element(by.css('#content h1'));

    this.organisationDetailsFields = ["Name","Address"];

    this.isSubNavigationsPresent = async function(){
        return await this.subNavigations.isPresent();
    }

    this.isOrganisationDetailsTabPresent = async function () {
        return await this.organisationDetailsTab.isPresent();
    }

    this.isUsersTabPresent = async function () {
        return await this.usersTab.isPresent();
    }

    this.getOrganisationStatus = async function () {
        return await this.statusBadge.getText();
    }

    this.clickUsersTab = async function(){
       await this.usersTab.click(); 
    }

    this.clickOrganisationdetaulsTab = async function () {
        await this.organisationDetailsTab.click();
    }

    this.validateOrganisationDetailsDisplayed = async function(){
        expect(await this.h1Header.getText()).to.equal("Organisation details");
        for(var fieldCtr = 0; fieldCtr < this.organisationDetailsFields.length; fieldCtr++){
            var fieldPresentStatus = await element(by.xpath("//dt[contains(@class,'govuk-check-your-answers__question') and contains(text()," + this.organisationDetailsFields[fieldCtr]+")]"))
            .isPresent();
            expect(fieldPresentStatus).to.be.true;
        }
    }

    this.validateUsersDisplayed = async function () {
        expect(await this.h1Header.getText()).to.equal("Users");
        expect(await element(by.css('xuilib-user-list td')).isPresent()).to.be.true;
    }
}

module.exports = new OrganisationPage;
