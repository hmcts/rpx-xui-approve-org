'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');

function HeaderPage() {

  this.aoPage = element(by.xpath("//a[contains(text(),'Approve organisations')]"));
  this.signOut = element(by.xpath("//a[contains(text(),'Sign out')]"));

  this.clickSignOut = function () {
    this.signOut.click();
    browser.sleep(SHORT_DELAY);
  };
}

module.exports = new HeaderPage;
