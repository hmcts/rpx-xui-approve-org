
Feature: Confirmation Screen

  Background:
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the active Organisation banner appear

@all
  Scenario: Verify the confirmation screen of Approve Organisation
    Then I click first organization view link
    Then I Select the Organisation and click Activate
    Then I approve the selected Organisations button
    Then I see the Confirmation screen of Organisations
    Then I click to Back to Organisations link
