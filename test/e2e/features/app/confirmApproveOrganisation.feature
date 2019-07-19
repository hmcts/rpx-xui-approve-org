
Feature: Confirmation Screen

  Background:
    When I navigate to EUI Approve Organisation Url
    Then I Check the pending Organisation banner appear



  Scenario: Verify the confirmation screen of Approve Organisation
    Then I Verify the Check Now Link
    Then I click on Check Now Link to redirect to Organisations Pending Activation page
    Then I Select the Organisation and click Activate
    Then I approve the selected Organisations button
    Then I see the Confirmation screen of Organisations
    Then I click to Back to Organisations link
