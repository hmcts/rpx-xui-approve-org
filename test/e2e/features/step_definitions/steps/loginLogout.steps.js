'use strict';

const loginPage = require('../../pageObjects/loginLogoutObjects');
const headerPage = require('../../pageObjects/headerPage');

const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../../support/constants');
const config = require('../../../config/config');
const browserWaits = require('../../../support/customWaits');
const { Then, When, Given } = require('@cucumber/cucumber');

async function waitForElement(el) {
  await browserWaits.waitForElement($(el))
}

async function loginattemptCheckAndRelogin(username, password, world){
  let loginAttemptRetryCounter = 1;

  while (loginAttemptRetryCounter < 3){
    try {
      await browserWaits.waitForElement(loginPage.dashboard_header)
      break;
    } catch (err){
      const emailFieldValue = await loginPage.getEmailFieldValue();
      if (!emailFieldValue.includes(username)){
        if (loginAttemptRetryCounter === 1){
          firstAttemptFailedLogins++;
        }
        if (loginAttemptRetryCounter === 2){
          secondAttemptFailedLogins++;
        }

        console.log(err+' email field is still present with empty value indicating  Login page reloaded due to EUI-1856 : Login re attempt '+loginAttemptRetryCounter);
        await loginPage.loginWithCredentials(username, password);
        loginAttemptRetryCounter++;
      }
    }
  }
  console.log('ONE ATTEMPT:  EUI-1856 issue occured / total logins => '+firstAttemptFailedLogins+' / '+loginAttempts);
  // world.attach('ONE ATTEMPT:  EUI-1856 issue occured / total logins => '+firstAttemptFailedLogins+' / '+loginAttempts);

  console.log('TWO ATTEMPT: EUI-1856 issue occured / total logins => '+secondAttemptFailedLogins+' / '+loginAttempts);
  // world.attach('TWO ATTEMPT: EUI-1856 issue occured / total logins => '+secondAttemptFailedLogins+' / '+loginAttempts);
}

let loginAttempts = 0;
let firstAttemptFailedLogins = 0;
let secondAttemptFailedLogins = 0;

When('I navigate to approve organisation Url', async function () {
  await browser.get(config.config.baseUrl);
  await browser.driver.manage()
    .deleteAllCookies();
  await browser.refresh();
  browser.sleep(AMAZING_DELAY);
});

Then('I should see failure error summary', async function () {
  await waitForElement('.heading-large');
  await expect(await loginPage.failure_error_heading.isDisplayed()).to.be.true;
  await expect(await loginPage.failure_error_heading.getText())
    .to
    .includes('Incorrect email or password');
});

Then('I am on Idam login page', async function () {
  await waitForElement('.heading-large');
  await expect(await loginPage.signinTitle.isDisplayed()).to.be.true;
  await expect(await loginPage.signinTitle.getText())
    .to
    .equal('Sign in');
  await expect(await loginPage.emailAddress.isDisplayed()).to.be.true;
  await expect(await loginPage.password.isDisplayed()).to.be.true;
});

When('I enter an valid email-address and password to login', async function () {
  await loginPage.emailAddress.sendKeys(config.username); //replace username and password
  await loginPage.password.sendKeys(config.password);
  // browser.sleep(SHORT_DELAY);
  await loginPage.signinBtn.click();
  browser.sleep(SHORT_DELAY);
  loginAttempts++;
  await loginattemptCheckAndRelogin(config.username, config.password, this);
});

When('I enter an Invalid email-address and password to login', async function () {
  await loginPage.givenIAmUnauthenticatedUser();
});

Given('I should be redirected to the Idam login page', async function () {
  await browserWaits.waitForElement(loginPage.signinTitle);
  await expect(await loginPage.signinTitle.getText())
    .to
    .equal('Sign in');
});

Then('I select the sign out link', async function () {
  browser.sleep(SHORT_DELAY);
  await expect(await loginPage.signOutlink.isDisplayed()).to.be.true;
  browser.sleep(SHORT_DELAY);
  await loginPage.signOutlink.click();
  browser.sleep(SHORT_DELAY);
});

Then('I should be redirected to approve organisation dashboard page', async function () {
  browser.sleep(LONG_DELAY);
  // await browserWaits.waitForBrowserReadyState(120);
  await browserWaits.waitForElement(loginPage.dashboard_header);
  await expect(await loginPage.dashboard_header.isDisplayed()).to.be.true;
  await expect(await loginPage.dashboard_header.getText())
    .to
    .equal('Approve organisation');
});

Given('I am logged into approve organisation with HMCTS admin', async function () {
  await loginPage.loginWithCredentials(config.username, config.password);
  await browser.sleep(SHORT_DELAY);
  loginAttempts++;
  await loginattemptCheckAndRelogin(config.username, config.password, this);
});

Given('I am logged into approve organisation with CWD admin', async function () {
  await loginPage.loginWithCredentials('cwd_admin@mailinator.com', 'Welcome01');
  browser.sleep(SHORT_DELAY);
  loginAttempts++;
  await loginattemptCheckAndRelogin('cwd_admin@mailinator.com', 'Welcome01', this);
});

Given('I am logged into approve organisation with approver prd admin', async function () {
  await loginPage.loginWithCredentials(config.approver_username, config.approver_password);
  browser.sleep(LONG_DELAY);
  loginAttempts++;
  await loginattemptCheckAndRelogin(config.approver_username, config.approver_password, this);
});

Given('I am logged into approve organisation with non approver prd admin', async function () {
  await loginPage.loginWithCredentials(config.username, config.password);
  browser.sleep(LONG_DELAY);
  loginAttempts++;
  await loginattemptCheckAndRelogin(config.username, config.password, this);

  // await browserWaits.waitForElement(headerPage.signOut);
});

Given('I am logged into approve organisation with FR judge details', async function () {
  await loginPage.loginWithCredentials(config.username, config.password);
  loginAttempts++;
  await loginattemptCheckAndRelogin(config.username, config.password, this);
});

Given('I navigate to approve organisation Url direct link', async function () {
  await browser.get(config.baseUrl + '/cases/case-filter');
  if (!process.env.TEST_URL.includes('demo')){ //Do not delete cookies for demo env.
    await browser.driver.manage()
      .deleteAllCookies();
    await browser.refresh();
  }
  browser.sleep(AMAZING_DELAY);
});

Then('I should be redirected back to Login page after direct link', async function () {
  browser.sleep(LONG_DELAY);
  await expect(await loginPage.signinTitle.getText())
    .to
    .equal('Sign in');
  browser.sleep(LONG_DELAY);
});


