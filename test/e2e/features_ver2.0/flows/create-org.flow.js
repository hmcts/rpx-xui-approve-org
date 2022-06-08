'use strict';


const { AMAZING_DELAY, SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const {config} = require('../../config/conf');
const approveOrganizationService = require('../pageObjects/approveOrganizationService');
const loginPage = require('../pageObjects/loginLogoutObjects');
const CreateOrganisationObjects = require('../pageObjects/createOrganisationObjects');

const createOrganisationObject = new CreateOrganisationObjects();


var BrowserWaits = require('../../support/customWaits')

class CreateOrganisationFlow {
  constructor() {
    this.emailAddress = element(by.css("[id='emailAddress']"));
    this.password = element(by.css("[id='password']"));
    this.signinTitle = element(by.css("h1.heading-large"));
    this.signinBtn = element(by.css("input.button"));
    this.signOutlink = element(by.xpath("//a[contains(text(),'Signout')]"));
    this.failure_error_heading = element(by.css("[id='validation-error-summary-heading']"));
    this.start_button = element(by.xpath("//*[@id='content']/div/div/a"));
    this.org_name = element(by.css("[id='orgName']"));
    this.continue_button = element(by.css("[id='createButtonContinue']"));
    this.officeAddressOne =element(by.xpath("//*[@id=\"officeAddressOne\"]"));
    this.townName = element(by.xpath("//input[@id='townOrCity']"));
    this.postcode = element(by.css("[id='postcode']"));
    this.PBAnumber1 = element(by.css("#PBANumber1"));
    this.PBAnumber2 = element(by.css("#PBANumber2"));
    this.DXreference = element(by.css("input[id='haveDxyes']"));
    this.DXNumber = element(by.css("[id='DXnumber']"));
    this.DXContinuee = element(by.xpath("//input[@id='createButtonContinue']"));
    this.DXexchange = element(by.css("[id='DXexchange']"));
    this.SRACheckBox = element(by.css("[id='haveSrayes']"));
    this.SRAContinuee = element(by.xpath("//input[@id='createButtonContinue']"));
    this.SRANumber = element(by.css("[id='sraNumber']"));
    this.firstName = element(by.css("[id='firstName']"));
    this.lastName = element(by.css("[id='lastName']"));
    this.emailAddr = element(by.css("#emailAddress"));
    this.submit_button = element(by.css("app-check-your-answers button"));
    this.org_success_heading = element(by.css("[class='govuk-panel__title']"))
    this.org_failure_error_heading = element(by.css("#error-summary-title"));
    this.off_address_error_heading = element(by.css("#error-summary-title"));
    this.pba_error_heading = element(by.css("#error-summary-title"));
    this.name_error_heading = element(by.css("#error-summary-title"));
    this.sra_error_heading = element(by.css("#error-summary-title"));
    this.email_error_heading = element(by.css("#error-summary-title"));

    this.checkYourAnswers = element(by.css(".govuk-check-your-answers"));

    this.registrationDetailsSubmitted = element(by.xpath("//h1[contains(text() ,'Registration details submitted')]"));

    this.backLink = element(by.css('.govuk-back-link'));
    this.alreadyRegisteredAccountHeader = element(by.css('h3.govuk-heading-m'));
    this.manageCasesAppLink = element(by.xpath('//a[contains(text(),"manage your cases")]'));
    this.manageOrgAppLink = element(by.xpath('//a[contains(text(),"manage your organisation")]'));
    this.mcWindowHandle = "";
  }

  async waitForElement(el) {
    await browser.wait(result => {
        return element(by.className(el)).isPresent();
    }, 600000);
}

  async navigateToApproveOrg(){
    await browser.driver.manage().deleteAllCookies();
    await browser.get(config.baseUrl);
    if ( (await browser.getCurrentUrl()).startsWith('https://login.microsoftonline.com/')) {
        await loginPage.microsoftSignIn();
      }
    await browser.sleep(MID_DELAY);
  }

  async  navigateToRegisterOrg() {
    //await browser.sleep(MID_DELAY);
    await browser.driver.manage().deleteAllCookies();
    await browser.get(config.registerOrgUrl);
    if ( (await browser.getCurrentUrl()).startsWith('https://login.microsoftonline.com/')) {
        await loginPage.microsoftSignIn();
      }
  }

async startRegistration() {
        // await this.waitForElement('govuk-heading-xl');
        await browser.get(config.registerOrgUrl + '/register-org/register');
        await BrowserWaits.retryWithActionCallback(async () => {
        try{
          await BrowserWaits.retryWithActionCallback(async () => {
            await BrowserWaits.waitForElement($('.govuk-heading-xl'));
          });

          await this.waitForElement('govuk-heading-xl', LONG_DELAY);
          await expect(createOrganisationObject.start_button.isDisplayed(), "Create Organisation START button not present").to.eventually.be.true;
          await expect(createOrganisationObject.start_button.getText())
            .to
            .eventually
            .equal('Start');
          await createOrganisationObject.start_button.click();
        }catch(err){
          await browser.get(config.registerOrgUrl + '/register-org/register');
          throw new Error(err);
        }
      });
    }

  async enterOrgName() {
    // await this.waitForElement('govuk-heading-xl');
    await this.amOnPage("What's the name of your organisation?");
    await expect(createOrganisationObject.org_name.isDisplayed(), "Input Organisation name nor present").to.eventually.be.true;
    await createOrganisationObject.enterOrgName();
    await createOrganisationObject.continue_button.click();
    // browser.sleep(MID_DELAY);
  }

  async enterOfficeAddressDetails () {
    // await this.waitForElement(createOrganisationObject.officeAddressOne);
    await this.amOnPage("What's the address of your main office?");
    await expect(createOrganisationObject.officeAddressOne.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.officeAddressOne.sendKeys("1, Cliffinton");
    // browser.sleep(MID_DELAY);
    await expect(createOrganisationObject.townName.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.townName.sendKeys("London");
    await expect(createOrganisationObject.postcode.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.postcode.sendKeys("SE15TY");
    await createOrganisationObject.continue_button.click();
    // browser.sleep(MID_DELAY);
  }

  async enterPbaDetails () {
    // await this.waitForElement('govuk-heading-xl');
    browser.sleep(MID_DELAY);
    await createOrganisationObject.PBAnumber1.isDisplayed();
    await createOrganisationObject.enterPBANumber();
    await createOrganisationObject.PBAnumber2.isDisplayed();
    await createOrganisationObject.enterPBA2Number();
    await createOrganisationObject.continue_button.click();
    browser.sleep(MID_DELAY);
  }

  async enterDxRefDetails () {
    await createOrganisationObject.clickDXreferenceCheck();
    browser.sleep(MID_DELAY);
    await createOrganisationObject.DXNumber.isDisplayed();
    await createOrganisationObject.enterDXNumber();
    await createOrganisationObject.DXexchange.isDisplayed();
    await createOrganisationObject.enterDXENumber();
    await createOrganisationObject.continue_button.click();
    // browser.sleep(MID_DELAY);

  }

  async enterSraNumber () {
    // await this.waitForElement('govuk-heading-xl');
    //await expect(createOrganisationObject.SRACheckBox.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.clickSRAreferenceCheck();
    // browser.sleep(MID_DELAY);
    // await this.waitForElement('govuk-heading-xl');
    await expect(createOrganisationObject.SRANumber.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.enterSRANumber();
    await createOrganisationObject.continue_button.click();
    // browser.sleep(MID_DELAY);
  }

  async enterFirstnameLastname () {
    await this.waitForElement('govuk-heading-xl');
    expect(createOrganisationObject.firstName.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.firstName.sendKeys("Mario");
    expect(createOrganisationObject.lastName.isDisplayed()).to.eventually.be.true;
    await createOrganisationObject.lastName.sendKeys("Perta");
    await createOrganisationObject.continue_button.click();
    // browser.sleep(MID_DELAY);
  }

  async enterEmailAddess () {
    // await this.waitForElement('govuk-heading-xl');
    await expect(createOrganisationObject.emailAddr.isDisplayed()).to.eventually.be.true;

    global.latestOrgSuperUser = Math.random().toString(36).substring(2) + "@mailinator.com";
    global.latestOrgSuperUserPassword = "Monday01";

    await createOrganisationObject.enterEmailAddress(global.latestOrgSuperUser);
    await createOrganisationObject.continue_button.click();


    // browser.sleep(MID_DELAY);
  }

  async checkSummaryAndSubmit () {
    // browser.sleep(MID_DELAY);
    // await this.waitForElement('govuk-heading-l');

    await expect(createOrganisationObject.submit_button.isDisplayed()).to.eventually.be.true;
    await expect(createOrganisationObject.submit_button.getText())
      .to
      .eventually
      .equal('Confirm and submit details');
    await createOrganisationObject.submit_button.click();

  }

  async checkOrgCreationSuccessful () {
    // browser.sleep(MID_DELAY);
    createOrganisationObject.waitForSubmission();
    await expect(createOrganisationObject.org_success_heading.isDisplayed()).to.eventually.be.true;
    await expect(createOrganisationObject.org_success_heading.getText())
      .to
      .eventually
      .equal('Registration details submitted');
  }

  async amOnPage(page) {
    await createOrganisationObject.waitForPage(page);
  };

}
module.exports = CreateOrganisationFlow;
