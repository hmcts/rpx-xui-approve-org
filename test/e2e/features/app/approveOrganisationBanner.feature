
Feature: Banner

  Background:
    When I navigate to EUI Approve Organisation Url
    Then I Check the pending Organisation banner appear

  @crossbrowser
  Scenario: Verify the Banner on Approve Organisation
    Then I Verify the Text on Banner


 @crossbrowser
  Scenario: Verify the Check Now Link on Approve Organisation
    Then I Verify the Check Now Link
    Then I click on Check Now Link to redirect to Organisations Pending Activation page
