
Feature: Verify Organisation Details Screen

  Background:
    When I navigate to EUI Approve Organisation Url
    Then I Check the pending Organisation banner appear



  Scenario: Verify the Approve Organisation Details
    Then I Verify the Check Now Link
    Then I click on Check Now Link to redirect to Organisations Pending Activation page
    Then I Select the Organisation and get the details and click Activate
    Then I review the Organisation Details such as Organisation Name and Address
