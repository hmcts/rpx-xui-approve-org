@functional_enabled
Feature: Delete Organisation

  Background:
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the active Organisation banner appear

  Scenario: Verify the Banner on Approve Organisation
    Then I Verify the Text on Banner

@all_deprecated @fullfunctional_deprecated
  Scenario: Verify the Check Now Link on Approve Organisation
    Then I Verify the Check Now Link
    Then I click on Check Now Link to redirect to Active Organisations page
    Then I search with organisation name and validate results
    Then I delete the organisation Active Organisation
    Then I see the Confirmation screen of Deleted Organisation
