'use strict';

const browserWaits = require('../../support/customWaits');

function ConfirmDecisionPage() {
  this.heading = $('#content h1');
  this.decisionKeys = $$('.govuk-summary-list__key');
  this.decisionValues = $$('.govuk-summary-list__value');
  this.confirmBtn = element(by.xpath('//button[contains(text(),"Confirm")]'));

  this.getContent = async function () {
    const details = {};
    await browserWaits.waitForElement(this.decisionKeys.last());
    const decisionKeys = await this.decisionKeys.getText();
    const decisionValues = await this.decisionValues.getText();
    decisionKeys.forEach((decisionKey, index) =>
      details[decisionKey] = decisionValues[index]
    );
    return details;
  };
}

module.exports = new ConfirmDecisionPage();
