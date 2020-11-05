'use strict';
const { defineSupportCode } = require('cucumber');
const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const EC = protractor.ExpectedConditions;
const browserWaits = require('../../../support/customWaits');
const organisationPage = require('../../pageObjects/organisationPage');

defineSupportCode(function ({ Given, When, Then }) {

    Then('I am on organisation page', async function () {
        await browserWaits.waitForElement( organisationPage.statusBadge);
        
    });

    Then('I see sub navigation tabs displayed', async function () {
        expect(await organisationPage.isSubNavigationsPresent()).to.be.true;
    });

    Then('I see sub navigation tabs not displayed', async function () {
        expect(await organisationPage.isSubNavigationsPresent()).to.be.false;
    });

    Then('I see sub navigation tab {string} displayed', async function (tabText) {
        if(tabText.includes('Users')){
            expect(await organisationPage.isUsersTabPresent()).to.be.true;
        } else if (tabText.includes('Organisation')){
            expect(await organisationPage.isOrganisationDetailsTabPresent()).to.be.true;
        }else{
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

});

