
const browserWaits = require('../../support/customWaits');

function StaffDetailsPage(){
  this.staffDetailsContainer = $('app-prd-caseworker-details');
  this.pageHeader = $('app-prd-caseworker-details .govuk-heading-l');
  this.templateCopyLink = $('app-prd-caseworker-details ol li a');

  this.errorMessageBanner = $('.govuk-error-summary');

  this.uploadFileInput = $('app-prd-caseworker-details #uploadarea input');
  this.uploadInputErrorMessage = $('div#uploadarea  .govuk-error-message');
  this.uploadButton = $('app-prd-caseworker-details .govuk-grid-column-three-quarters button');

  this.uploadInfoDetailsContainer = $('app-prd-upload-info-detail');
  this.partialSuccessDetailsTable = $('app-prd-upload-partial-success table');

  this.uploadSuccessConfirmationMessage = $('app-prd-upload-info-detail .govuk-panel--confirmation h1');
  this.uploadDetailsMessage = $('app-prd-upload-info-detail .govuk-body:nth-of-type(2)');

  this.partialSuccessContainer = $('app-prd-upload-partial-success');
  this.appServiceDownContainer = $('app-service-down');
  this.notAuthorisedContainer = $('app-hmcts-not-authorised');

  this.waitForPage = async function(){
    await browserWaits.waitForElement(this.staffDetailsContainer);
  };

  this.amOnPage = async function(){
    return await this.isElementPresent(this.staffDetailsContainer);
  };

  this.getTitle = async function(){
    return await this.pageHeader.getText();
  };

  this.getTemplateCopyDownloadLink = async function(){
    return await this.templateCopyLink.getAttribute('href');
  };

  this.selectFile = async function (fileToUpload) {
    return await this.uploadFileInput.sendKeys(fileToUpload);
  };

  this.clickUpload = async function(){
    await this.uploadButton.click();
  };

  this.waitForUploadInfoDetails = async function(){
    return await this.isElementPresent(this.uploadInfoDetailsContainer);
  };

  this.isSuccessMessageBannerPresent = async function(){
    await this.waitForUploadInfoDetails();
    return await this.uploadSuccessConfirmationMessage.isPresent();
  };

  this.getUploadInfoDetails = async function () {
    await this.waitForUploadInfoDetails();
    return await this.uploadDetailsMessage.getText();
  };

  this.isServiceDownMessageDisplayed = async function(){
    return await this.isElementPresent(this.appServiceDownContainer);
  };

  this.isUnauthorisedMessageDisplayed = async function () {
    return await this.isElementPresent(this.notAuthorisedContainer);
  };

  this.isPartialSuccessPageDisplayed = async function(){
    return await this.isElementPresent(this.partialSuccessContainer);
  };

  this.isPartialSuccessH1headerMessageDisplayed = async function(message){
    expect(await this.isPartialSuccessPageDisplayed(), 'Partial success page is not displayed').to.be.true;
    expect(await this.partialSuccessContainer.$('h1').getText(), 'Partial success page header does not match').to.equal(message);
  };

  this.assertH3headingMessageDisplayed = async function (message) {
    expect(await this.isPartialSuccessPageDisplayed(), 'Partial success page is not displayed').to.be.true;
    await browserWaits.waitForElement(element(by.xpath(`h3[contains(text(),"${message}")]`)));
  };

  this.isPartialSuccessDetailsTableDisplayed = async function () {
    expect(await this.isPartialSuccessPageDisplayed(), 'Partial success page is not displayed').to.be.true;
    return await this.partialSuccessDetailsTable.isPresent();
  };

  this.isErrorMessageBannerDisplayed = async function(){
    return await this.isElementPresent(this.errorMessageBanner);
  };

  this.getInputFileErrorMessage = async function(){
    const errorMessage = await this.uploadInputErrorMessage.getText();
    return errorMessage.split('\n');
  };

  this.getInputFileErrorMessageDisplayed = async function () {
    return await this.uploadInputErrorMessage.isDisplayed();
  };

  this.isUploadSuccessPageDisplayed = async function(){
    return await this.isElementPresent(this.uploadInfoDetailsContainer);
  };

  this.isUploadProcessSuccess = async function(){
    return await browserWaits.waitForConditionAsync(async() => {
      const isSuccess = await this.uploadInfoDetailsContainer.isPresent();
      const isPartialSuccess = await this.partialSuccessContainer.isPresent();
      return isSuccess || isPartialSuccess;
    });
  };

  this.isElementPresent = async function(elementToBePresent){
    try {
      await browserWaits.waitForElement(elementToBePresent);
      return true;
    } catch (err) {
      return false;
    }
  };
}

module.exports = new StaffDetailsPage();
