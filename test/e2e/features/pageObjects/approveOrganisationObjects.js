'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');

function approveOrganisationBannerObjects() {

  this.emailAddress = element(by.css("[id='emailAddress']"));
  this.password = element(by.css("[id='password']"));
  this.submit_button= element(by.css("[class='div.govuk-button']"));

  this.approveorgBanner= element(by.xpath("//*[@id='content']/div"));
  this.bannerText= element(by.xpath("//*[@id='content']/div/div"));
  this.checkNow= element(by.xpath("//a[contains(text(),'Check now.')]"));
  this.pendingOrganisationText= element(by.xpath("//*[@id='main-content']/h1"));

  this.selectCheckBox= element(by.xpath("//*[@id='main-content']/lib-govuk-table/table/tbody/tr[1]/td[1]/lib-gov-checkbox/div/input"));
  this.activate_button= element(by.xpath("//*[@id='main-content']/button"));
  this.approve_button= element(by.xpath("//button[@class='govuk-button']"));
  this.confirmationScreen= element(by.xpath("//div[@class='govuk-panel govuk-panel--confirmation']"));
  this.backtoOrganisations= element(by.xpath("//a[contains(text(),'Back to Organisations')]"));
  this.mainHeader=element(by.xpath("//h1[@class='hmcts-page-heading__title govuk-heading-xl']"));




  this.givenIAmUnauthenticatedUser = async function () {
    await this.enterUrEmail("test@gmail.com");
    await this.enterPassword("123");
    await this.clickSignIn();
  };

  this.enterUrEmail = async function (email) {
    await this.emailAddress.sendKeys(email);
  };

  this.enterPassword = async function (password) {
    await this.password.sendKeys(password);
  };

  this.clickSignIn = function () {
    this.signinBtn.click();
    browser.sleep(SHORT_DELAY);
  };

  this.waitFor = function (selector) {
    return browser.wait(function () {
      return browser.isElementPresent(selector);
    }, LONG_DELAY);
  };


  this.defaultTime = function () {
    this.setDefaultTimeout(60 * 1000);
  };


}

module.exports = new approveOrganisationBannerObjects;
