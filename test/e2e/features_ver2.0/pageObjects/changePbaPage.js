'use strict';

const browserWaits = require('../../support/customWaits');

function ChangePbaPage() {
  this.pageHeading = $('.govuk-heading-xl');
  this.addPbaButton = element(by.xpath('//button[contains(text(),"Add")]'));
  this.removePbaButtons = element.all(by.xpath('//button[contains(text(),"Remove")]'));
  this.submitButton = element(by.xpath('//button[contains(text(),"Submit")]'));

  this.getHeading = async function () {
    await browserWaits.waitForElementClickable(this.addPbaButton);
    const heading = await this.pageHeading.getText();
    return heading;
  };

  this.enterPba = async function (count, value) {
    const pbaInputField = $('#pba' + count);
    await browserWaits.waitForElement(pbaInputField);
    await pbaInputField.clear();
    await pbaInputField.sendKeys(value);
  };

  this.addPba = async function (count, value) {
    await this.addPbaButton.click();
    this.enterPba(count, value);
  };

  this.removePba = async function (count) {
    const element = this.removePbaButtons.get(count);
    await element.click();
  };

  this.submitPage = async function () {
    await this.submitButton.click();
  };
}

module.exports = new ChangePbaPage();
