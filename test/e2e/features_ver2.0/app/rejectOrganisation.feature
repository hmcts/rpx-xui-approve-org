@2.0_test @fullfunctional @reject_org
Feature: Reject New Organisation

  Background: 
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the home page title appear

  Scenario: Reject New Organisation
    When I click first organization view link
    Then I see "Approve organisation" on organisation details page
    And I see the organisation state as "PENDING"
    When I select reject organisation
    Then I am on confirm decision page for "rejection"
    When I confirm the decision
    Then I get a registration "rejected" confirmation
