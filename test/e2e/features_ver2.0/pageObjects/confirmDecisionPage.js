'use strict';

const browserWaits = require('../../support/customWaits');

function ConfirmDecisionPage() {

    this.heading = $('#content h1');
    this.decisionKeys = $$('.govuk-summary-list__key');
    this.decisionValues = $$('.govuk-summary-list__value');
    this.confirmBtn = element(by.xpath('//button[contains(text(),"Confirm")]'));

    this.getContent = async function () {
        let details = {};
        await browserWaits.waitForElement(this.decisionKeys.last());
        let decisionKeys = await this.decisionKeys.getText();
        let decisionValues = await this.decisionValues.getText();
        decisionKeys.forEach((decisionKey, index) =>
            details[decisionKey] = decisionValues[index]
        );
        return details;
    };

}

module.exports = new ConfirmDecisionPage;
