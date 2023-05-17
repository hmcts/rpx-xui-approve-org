'use strict';

/*
  Code adapted from https://github.com/hmcts/rpx-xui-manage-organisations/blob/master/test/e2e/features/pageObjects/createOrganisationObjects.js
*/

const BrowserWaits = require('../../support/customWaits');

class CreateOrganisationObjects {
  static orgData = {};

  constructor() {
    this.emailAddress = element(by.css('[id=\'emailAddress\']'));
    this.password = element(by.css('[id=\'password\']'));
    this.signinTitle = element(by.css('h1.heading-large'));
    this.signinBtn = element(by.css('input.button'));
    this.signOutlink = element(by.xpath('//a[contains(text(),\'Signout\')]'));
    this.failure_error_heading = element(by.css('[id=\'validation-error-summary-heading\']'));
    this.start_button = element(by.xpath('//*[@id=\'content\']/div/div/a'));
    this.org_name = element(by.css('[id=\'orgName\']'));
    this.continue_button = element(by.css('[id=\'createButton\']'));
    this.officeAddressOne = element(by.xpath('//*[@id="officeAddressOne"]'));
    this.townName = element(by.xpath('//input[@id=\'townOrCity\']'));
    this.postcode = element(by.css('[id=\'postcode\']'));
    this.PBAnumber1 = element(by.css('#PBANumber1'));
    this.PBAnumber2 = element(by.css('#PBANumber2'));
    this.addAnotherPbaNumber = element(by.css('#addAnotherPBANumber'));
    this.DXreference = element(by.css('input[id=\'haveDxyes\']'));
    this.DXNumber = element(by.css('[id=\'DXnumber\']'));
    this.DXContinuee = element(by.xpath('//input[@id=\'createButton\']'));
    this.DXexchange = element(by.css('[id=\'DXexchange\']'));
    this.SRACheckBox = element(by.css('[id=\'haveSrayes\']'));
    this.SRAContinuee = element(by.xpath('//input[@id=\'createButton\']'));
    this.SRANumber = element(by.css('[id=\'sraNumber\']'));
    this.firstName = element(by.css('[id=\'firstName\']'));
    this.lastName = element(by.css('[id=\'lastName\']'));
    this.emailAddr = element(by.css('#emailAddress'));
    this.submit_button = element(by.css('app-check-your-answers button'));
    this.org_success_heading = element(by.css('[class=\'govuk-panel__title\']'));
    this.org_failure_error_heading = element(by.css('#error-summary-title'));
    this.off_address_error_heading = element(by.css('#error-summary-title'));
    this.pba_error_heading = element(by.css('#error-summary-title'));
    this.name_error_heading = element(by.css('#error-summary-title'));
    this.sra_error_heading = element(by.css('#error-summary-title'));
    this.email_error_heading = element(by.css('#error-summary-title'));

    this.checkYourAnswers = element(by.css('.govuk-check-your-answers'));

    this.registrationDetailsSubmitted = element(by.xpath('//h1[contains(text() ,\'Registration details submitted\')]'));

    this.backLink = element(by.css('.govuk-back-link'));
    this.alreadyRegisteredAccountHeader = element(by.css('h3.govuk-heading-m'));
    this.manageCasesAppLink = element(by.xpath('//a[contains(text(),"manage your cases")]'));
    this.manageOrgAppLink = element(by.xpath('//a[contains(text(),"manage your organisation")]'));
    this.mcWindowHandle = '';
  }

  static storeOrgData(key, value) {
    CreateOrganisationObjects.orgData[key] = value;
  }

  static getOrgData() {
    return CreateOrganisationObjects.orgData;
  }

  async clickDXreferenceCheck() {
    BrowserWaits.waitForElement(this.DXContinuee);
    await this.DXreference.click();
    await this.DXContinuee.click();
  }

  async clickSRAreferenceCheck() {
    BrowserWaits.waitForElement(this.SRAContinuee);
    await this.SRACheckBox.click();
    await this.SRAContinuee.click();
  }

  async enterPBANumber() {
    BrowserWaits.waitForElement(this.PBAnumber1);
    const ramdomPBA = Math.floor(Math.random() * 9000000) + 1000000;
    CreateOrganisationObjects.storeOrgData('pba_1', 'PBA' + ramdomPBA);
    await this.PBAnumber1.sendKeys('PBA' + ramdomPBA);
  }

  async enterPBA2Number() {
    BrowserWaits.waitForElement(this.PBAnumber2);
    const ramdomPBA2 = Math.floor(Math.random() * 9000000) + 1000000;
    CreateOrganisationObjects.storeOrgData('pba_2', 'PBA' + ramdomPBA2);
    await this.PBAnumber2.sendKeys('PBA' + ramdomPBA2);
  }

  async enterDXNumber() {
    BrowserWaits.waitForElement(this.DXNumber);
    const ramdomDX = Math.floor(Math.random() * 9000000000) + 1000000000;
    CreateOrganisationObjects.storeOrgData('dx_number', 'DX ' + ramdomDX);
    await this.DXNumber.sendKeys('DX ' + ramdomDX);
  }

  async enterDXENumber() {
    BrowserWaits.waitForElement(this.DXexchange);
    const ramdomDX = Math.floor(Math.random() * 9000000000) + 1000000000;
    CreateOrganisationObjects.storeOrgData('dx_exchange', 'DXE' + ramdomDX);
    await this.DXexchange.sendKeys('DXE' + ramdomDX);
  }

  async enterSRANumber() {
    BrowserWaits.waitForElement(this.SRANumber);
    const ramdomSRA = Math.floor(Math.random() * 9000000000) + 1000000000;
    CreateOrganisationObjects.storeOrgData('sra_id', 'SRA' + ramdomSRA);
    await this.SRANumber.sendKeys('SRA' + ramdomSRA);
  }

  async enterOrgName(testorgName) {
    BrowserWaits.waitForElement(this.org_name);
    const orgName = 'AutoTest' + Math.random().toString(36).substring(2);
    global.latestOrgCreated = orgName;
    CreateOrganisationObjects.storeOrgData('org_name', orgName);
    await this.org_name.sendKeys(testorgName ? testorgName : orgName);
    await browser.sleep(1000);
  }

  async enterEmailAddress(email) {
    BrowserWaits.waitForElement(this.emailAddr);
    CreateOrganisationObjects.storeOrgData('email', email);
    await this.emailAddr.sendKeys(email);
  }

  async waitForPage(page) {
    switch (page) {
      case 'What\'s the name of your organisation?':
        await BrowserWaits.waitForElement(this.org_name);
        break;
      case 'What\'s the address of your main office?':
        await BrowserWaits.waitForElement(this.officeAddressOne);
        break;
      case 'What\'s your payment by account (PBA) number for your organisation?':
        await BrowserWaits.waitForElement(this.PBAnumber1);
        break;
      case 'Do you have a DX reference for your main office?':

        await BrowserWaits.waitForElement(element(by.xpath('//h1[contains(text(),\'Do you have a Document Exchange (DX) reference for your main office\')]')));
        break;
      case 'What\'s the DX reference for your main office?':
        await BrowserWaits.waitForElement(this.DXNumber);
        break;
      case 'Do you have an organisation SRA ID?':
        await BrowserWaits.waitForElement(element(by.xpath('//h1[contains(text(),\'Do you have an organisation Solicitors Regulation Authority (SRA) ID\')]')));
        break;
      case 'Enter your organisation SRA ID':
        await BrowserWaits.waitForElement(this.SRANumber);
        break;
      case 'What\'s your name?':
        await BrowserWaits.waitForElement(this.lastName);
        break;
      case 'What\'s your email address?':
        await BrowserWaits.waitForElement(this.emailAddress);
        break;
      case 'Check your answers before you register':
        await BrowserWaits.waitForElement(this.checkYourAnswers);
        break;
    }
  }

  async waitForSubmission() {
    await BrowserWaits.waitForElement(this.registrationDetailsSubmitted);
  }

  async enterAddressDetails() {
    await this.officeAddressOne.isDisplayed();
    const addressDetails = ['1, Cliffinton', 'London', 'SE15TY'];
    CreateOrganisationObjects.storeOrgData('address', addressDetails);
    await this.officeAddressOne.sendKeys(addressDetails[0]);
    await this.townName.sendKeys(addressDetails[1]);
    await this.postcode.sendKeys(addressDetails[2]);
  }

  async enterUserFirstandLastName() {
    const name = ['Mario', 'Perta'];
    CreateOrganisationObjects.storeOrgData('name', name);
    await this.firstName.sendKeys(name[0]);
    await this.lastName.sendKeys(name[1]);
  }
}

module.exports = CreateOrganisationObjects;
