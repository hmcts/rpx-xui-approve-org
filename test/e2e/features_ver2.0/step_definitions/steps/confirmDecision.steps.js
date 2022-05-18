'use strict';

const { defineSupportCode } = require('cucumber');
const browserWaits = require('../../../support/customWaits');
const confirmDecisionPage = require('../../pageObjects/confirmDecisionPage');

defineSupportCode(function ({ When, Then }) {

    Then('I am on confirm decision page', async function () {
        await browserWaits.waitForElement(confirmDecisionPage.confirmBtn);
        expect(confirmDecisionPage.heading.getText()).to.eventually.equal('Confirm your decision');
        let confirmDecisionContent = await confirmDecisionPage.getContent();
        expect(confirmDecisionContent.Decision).to.equal('Approve the organisation');
    });

    When('I confirm the decision', async function () {
        await browserWaits.waitForElementClickable(confirmDecisionPage.confirmBtn);
        await confirmDecisionPage.confirmBtn.click();
    });

});
