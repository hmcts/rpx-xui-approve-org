'use strict';

const { defineSupportCode } = require('cucumber');
const CreateOrganisationFlow = require('../../flows/create-org.flow');

defineSupportCode(function ({ Given, When, Then }) {
  let createOrganisationFlow = new CreateOrganisationFlow();

  Given(/^I register a new organisation$/, async function () {
    await createOrganisationFlow.navigateToRegisterOrg();
    await createOrganisationFlow.startRegistration();
    await createOrganisationFlow.enterOrgName();
    await createOrganisationFlow.enterOfficeAddressDetails();
    await createOrganisationFlow.amOnPage("What's your payment by account (PBA) number for your organisation?");
    await createOrganisationFlow.enterPbaDetails();
    await createOrganisationFlow.amOnPage("Do you have a DX reference for your main office?");
    await createOrganisationFlow.enterDxRefDetails();
    await createOrganisationFlow.amOnPage("Do you have an organisation SRA ID?");
    await createOrganisationFlow.enterSraNumber();
    await createOrganisationFlow.amOnPage("What's your name?");
    await createOrganisationFlow.enterFirstnameLastname();
    await createOrganisationFlow.amOnPage("What's your email address?");
    await createOrganisationFlow.enterEmailAddess();
    await createOrganisationFlow.amOnPage("Check your answers before you register");
    await createOrganisationFlow.checkSummaryAndSubmit();
    await createOrganisationFlow.checkOrgCreationSuccessful();
  });

});
