'use strict';

const loginPage = require('../../pageObjects/loginLogoutObjects');

const { defineSupportCode } = require('cucumber');
const { AMAZING_DELAY, SHORT_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/conf.js');
const browserWaits = require('../../../support/customWaits');


async function waitForElement(el) {
  await browser.wait(result => {
    return element(by.className(el)).isPresent();
  }, 600000);
}

async function loginattemptCheckAndRelogin(username, password, world) {

  let loginAttemptRetryCounter = 1;

  while (loginAttemptRetryCounter < 3) {

    try {
      await browserWaits.waitForstalenessOf(loginPage.emailAddress, 5);
      break;
    } catch (err) {
      let emailFieldValue = await loginPage.getEmailFieldValue();
      if (!emailFieldValue.includes(username)) {
        if (loginAttemptRetryCounter === 1) {
          firstAttemptFailedLogins++;
        }
        if (loginAttemptRetryCounter === 2) {
          secondAttemptFailedLogins++;
        }

        console.log(err + " email field is still present with empty value indicating  Login page reloaded due to EUI-1856 : Login re attempt " + loginAttemptRetryCounter);
        world.attach(err + " email field is still present with empty value indicating Login page reloaded due to EUI-1856 : Login re attempt " + loginAttemptRetryCounter);
        await loginPage.loginWithCredentials(username, password);
        loginAttemptRetryCounter++;
      }
    }
  }
  console.log("ONE ATTEMPT:  EUI-1856 issue occured / total logins => " + firstAttemptFailedLogins + " / " + loginAttempts);
  world.attach("ONE ATTEMPT:  EUI-1856 issue occured / total logins => " + firstAttemptFailedLogins + " / " + loginAttempts);

  console.log("TWO ATTEMPT: EUI-1856 issue occured / total logins => " + secondAttemptFailedLogins + " / " + loginAttempts);
  world.attach("TWO ATTEMPT: EUI-1856 issue occured / total logins => " + secondAttemptFailedLogins + " / " + loginAttempts);


}

let loginAttempts = 0;
let firstAttemptFailedLogins = 0;
let secondAttemptFailedLogins = 0;

defineSupportCode(function ({ Given, When, Then }) {

  Then(/^I should see failure error summary$/, async function () {
    await waitForElement('heading-large');
    await expect(loginPage.failure_error_heading.isDisplayed()).to.eventually.be.true;
    await expect(loginPage.failure_error_heading.getText())
      .to
      .eventually
      .be
      .oneOf(['Incorrect email or password', 'There is a problem with your account login details']);
  });

  Then(/^I am on Idam login page$/, { timeout: 600 * 1000 }, async function () {
    await waitForElement('heading-large');
    await expect(loginPage.signinTitle.isDisplayed()).to.eventually.be.true;
    await expect(loginPage.signinTitle.getText())
      .to
      .eventually
      .equal('Sign in');
    await expect(loginPage.emailAddress.isDisplayed()).to.eventually.be.true;
    await expect(loginPage.password.isDisplayed()).to.eventually.be.true;

  });

  When(/^I enter an valid email-address and password to login$/, async function () {
    await loginPage.emailAddress.sendKeys(this.config.username);          //replace username and password
    await loginPage.password.sendKeys(this.config.password);
    // browser.sleep(SHORT_DELAY);
    await loginPage.signinBtn.click();
    browser.sleep(SHORT_DELAY);
    loginAttempts++;
    await loginattemptCheckAndRelogin(this.config.username, this.config.password, this);

  });

  When(/^I enter an Invalid email-address and password to login$/, async function () {
    await loginPage.givenIAmUnauthenticatedUser();

  });

  When(/^I should be redirected to the Idam login page$/, async function () {
    await browserWaits.waitForElement(loginPage.signinTitle);
    await expect(loginPage.signinTitle.getText())
      .to
      .eventually
      .equal('Sign in');
    browser.sleep(LONG_DELAY);
  });

  When(/^I select the sign out link$/, async function () {
    browser.sleep(SHORT_DELAY);
    await expect(loginPage.signOutlink.isDisplayed()).to.eventually.be.true;
    browser.sleep(SHORT_DELAY);
    await loginPage.signOutlink.click();
    browser.sleep(SHORT_DELAY);
  });

  Then(/^I should be redirected to approve organisation dashboard page$/, async function () {
    browser.sleep(SHORT_DELAY);
    await browserWaits.waitForBrowserReadyState(120);
    await browserWaits.waitForElement(loginPage.dashboard_header);
    await expect(loginPage.dashboard_header.isDisplayed()).to.eventually.be.true;
    await expect(loginPage.dashboard_header.getText())
      .to
      .eventually
      .equal('Approve organisation');

  });

  Given(/^I am logged into approve organisation with HMCTS admin$/, async function () {
    await loginPage.loginWithCredentials(this.config.username, this.config.password);
    browser.sleep(SHORT_DELAY);
    loginAttempts++;
    await loginattemptCheckAndRelogin(this.config.username, this.config.password, this);
  });

  Given(/^I am logged into approve organisation with FR judge details$/, async function () {
    await loginPage.loginWithCredentials(this.config.username, this.config.password);
    loginAttempts++;
    await loginattemptCheckAndRelogin(this.config.username, this.config.password, this);

  });

  Given(/^I navigate to approve organisation Url direct link$/, { timeout: 600 * 1000 }, async function () {
    await browser.get(config.config.baseUrl + '/cases/case-filter');
    if (!process.env.TEST_URL.includes('demo')) { //Do not delete cookies for demo env.
      await browser.driver.manage()
        .deleteAllCookies();
      await browser.refresh();
    }
    browser.sleep(AMAZING_DELAY);
  });

  Then(/^I should be redirected back to Login page after direct link$/, async function () {
    browser.sleep(LONG_DELAY);
    await expect(loginPage.signinTitle.getText())
      .to
      .eventually
      .equal('Sign in');
    browser.sleep(LONG_DELAY);
  });

});
