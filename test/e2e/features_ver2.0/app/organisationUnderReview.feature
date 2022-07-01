@2.0_test @fullfunctional @org_under_review
Feature: Organisation Under Review

  Background: 
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the home page title appear

  Scenario: Reject New Organisation
    When I click first organization view link
    Then I see "Approve organisation" on organisation details page
    And I see the organisation state as "PENDING"
    When I select place registration under review
    Then I am on confirm decision page for "org_under_review"
    When I confirm the decision
    Then I get a registration "under_review" confirmation
