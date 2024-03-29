'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const BrowserWaits = require('../../support/customWaits');
const reportLogger = require('../../../codeceptCommon/reportLogger')

function loginLogoutObjects() {
  this.emailAddress = element(by.css('input#username'));
  this.password = element(by.css('[id=\'password\']'));
  this.signinTitle = element(by.css('h1.heading-large'));
  this.signinBtn = element(by.css('input.button'));
  this.signOutlink = element(by.xpath('//a[@class=\'hmcts-header__navigation-link\']'));
  this.failure_error_heading = element(by.css('[id=\'validation-error-summary-heading\']'));
  this.dashboard_header= element(by.xpath('//a[@class=\'hmcts-header__link\']'));
  this.microsoftSignInObjects = {
    email: $('#i0116'),
    password: $('#i0118'),
    submitButton: $('#idSIButton9')
  };

  this.isLoginPageDisplayed = async function(){
    try {
      await BrowserWaits.waitForElement(this.emailAddress);
      return true;
    } catch (err){
      console.log('Login page not displayed. error '+err);
      return false;
    }
  };

  this.microsoftSignIn = async function(){
    if (!process.env.hasOwnProperty('HMCTS_EMAIL') || !process.env.hasOwnProperty('HMCTS_PASSWORD')) {
      throw new Error('HMCTS_EMAIL / HMCTS_PASSWORD env. vars undefined');
    }
    await BrowserWaits.waitForElement(this.microsoftSignInObjects.email);
    await this.microsoftSignInObjects.email.sendKeys(process.env.HMCTS_EMAIL);
    await this.microsoftSignInObjects.submitButton.click();
    await BrowserWaits.waitForElement(this.microsoftSignInObjects.password);
    await this.microsoftSignInObjects.password.sendKeys(process.env.HMCTS_PASSWORD);
    await this.microsoftSignInObjects.submitButton.click();
    await BrowserWaits.waitForElement(this.microsoftSignInObjects.submitButton);
    await this.microsoftSignInObjects.submitButton.click();
  };

  this.getEmailFieldValue = async function(){
    return await this.emailAddress.getAttribute('value');
  };

  this.loginWithCredentials = async function (username, password) {
    reportLogger.AddMessage(`Login ${username}/${password}`)
    await BrowserWaits.waitForElement(this.emailAddress);
    await this.enterUrEmail(username);
    await this.enterPassword(password);
    await this.clickSignIn();
  };

  this.givenIAmLoggedIn = async function () {
    await this.enterUrEmail('');
    await this.enterPassword('');
    await this.clickSignIn();
  };

  this.givenIAmUnauthenticatedUser = async function () {
    await this.enterUrEmail('test@gmail.com');
    await this.enterPassword('123');
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

module.exports = new loginLogoutObjects();
