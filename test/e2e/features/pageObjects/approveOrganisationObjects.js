'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');

const browserWaits = require('../../support/customWaits');

function approveOrganisationBannerObjects() {

  this.emailAddress = element(by.css("[id='emailAddress']"));
  this.password = element(by.css("[id='password']"));
  this.submit_button= element(by.css("[class='div.govuk-button']"));

  this.approveorgBanner= element(by.xpath("//*[@id='content']/div"));
  //this.checkNow= element(by.xpath("//a[contains(text(),'Check now.')]"));
  // this.checkNow= element(by.partialLinkText("Check no"));
  this.activeOrgsTab = element(by.partialLinkText("Active organisations"));

  this.selectCheckBox= element(by.xpath("//*[@id='main-content']/form/table/thead/tr[2]/td[1]/div"));
  this.activate_button= element(by.xpath("//button[@class='govuk-button']"));
  this.approve_button= element(by.xpath("//button[@class='govuk-button']"));
  this.confirmationScreen= element(by.xpath("//div[@class='govuk-panel govuk-panel--confirmation']"));
  this.backtoOrganisations= element(by.partialLinkText("Back to organisatio"));
  this.mainHeader = element(by.xpath("//h1[contains(@class,'govuk-heading-xl')]"));
  this.secondaryHeader = element(by.xpath("//h2[contains(@class,'govuk-heading-l')]"));

  this.orgName=element(by.xpath("//*[@id='main-content']/form/table/thead/tr[2]/td[2]]"));
  this.administratorText=element(by.xpath("//*[@id='main-content']/form/table/thead/tr[2]/td[4]"));
  this.addressText=element(by.xpath("//*[@id='main-content']/form/table/thead/tr[2]/td[3]"));

  this.approveOrgName= element(by.xpath("//h2[@class='govuk-heading-m']"));
  this.approveAdministratorText= element(by.xpath("//*[@id='main-content']/div/div/div/dl/div[2]/dd/div[2]"));
  this.approveAddress= element(by.xpath("//*[@id='main-content']/div/div/div/dl/div[1]/dd"));


//*[@id="main-content"]/form/table/thead/tr[2]/td[1]/div

  //*[@id="G33DM47"]

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
