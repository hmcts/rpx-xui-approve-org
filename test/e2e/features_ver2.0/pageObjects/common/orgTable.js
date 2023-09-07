'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const browserWaits = require('../../../support/customWaits');

function OrgTable() {
  this.rows = $$('.govuk-table tr');
  this.tableHeaders = $$('.govuk-table__header');
  this.viewOrg = element(by.xpath('//thead/tr[2]/td[6]'));
  this.paginationElements = $$('#pagination-label ul li');

  this.getRowContent = async function (rowNum) {
    const rowContent = {};
    await this.waitForTableToDisplay();
    const tableHeaders = await this.tableHeaders.getText();
    const rowElement = await this.rows.get(rowNum);
    const tableRowText = await rowElement.$$('td').getText();
    tableHeaders.forEach((tableHeader, index) => {
      rowContent[tableHeader] = tableRowText[index];
    });
    return rowContent;
  };

  this.waitForTableToDisplay = async function () {
    await browserWaits.waitForElement(this.rows.get(0));
  };

  this.clickViewOnFirstOrganisation = async function () {
    await browserWaits.waitForElementClickable(this.viewOrg);
    await this.viewOrg.click();
  };

  this.selectPage = async function (pageNum) {
    await this.paginationElements.get(pageNum).$('a').click();
    await browser.sleep(MID_DELAY);
  };
}

module.exports = new OrgTable();
