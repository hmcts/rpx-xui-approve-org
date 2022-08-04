'use strict';

/*
  https://github.com/hmcts/rpx-xui-manage-organisations/blob/master/test/e2e/features/step_definitions/createOrganisation.steps.js
*/

const { defineSupportCode } = require('cucumber');
const CreateOrganisationFlow = require('../../flows/create-org.flow');

defineSupportCode(function ({ Given, When, Then }) {
  let createOrganisationFlow = new CreateOrganisationFlow();

  Given(/^I register a new organisation$/, async function () {
    await createOrganisationFlow.navigateToRegisterOrg();
    await createOrganisationFlow.startRegistration();
    await createOrganisationFlow.enterOrgName();
    await createOrganisationFlow.enterOfficeAddressDetails();
    await createOrganisationFlow.enterPbaDetails();
    await createOrganisationFlow.enterDxRefDetails();
    await createOrganisationFlow.enterSraNumber();
    await createOrganisationFlow.enterFirstnameLastname();
    await createOrganisationFlow.enterEmailAddess();
    await createOrganisationFlow.checkSummaryAndSubmit();
    await createOrganisationFlow.checkOrgCreationSuccessful();
  });

});
