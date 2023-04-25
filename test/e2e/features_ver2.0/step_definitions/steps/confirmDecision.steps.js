'use strict';

const { defineSupportCode } = require('cucumber');
const browserWaits = require('../../../support/customWaits');
const confirmDecisionPage = require('../../pageObjects/confirmDecisionPage');

defineSupportCode(function ({ When, Then }) {
  Then('I am on confirm decision page for {string}', async function (action) {
    const decisionStatements = {
      'approval': 'Approve the organisation',
      'rejection': 'Reject the registration',
      'org_under_review': 'Put the registration on hold'
    };
    await browserWaits.waitForElement(confirmDecisionPage.confirmBtn);
    expect(confirmDecisionPage.heading.getText()).to.eventually.equal('Confirm your decision');
    const confirmDecisionContent = await confirmDecisionPage.getContent();
    expect(confirmDecisionContent.Decision).to.equal(decisionStatements[action]);
  });

  When('I confirm the decision', async function () {
    await browserWaits.waitForElementClickable(confirmDecisionPage.confirmBtn);
    await confirmDecisionPage.confirmBtn.click();
  });
});
