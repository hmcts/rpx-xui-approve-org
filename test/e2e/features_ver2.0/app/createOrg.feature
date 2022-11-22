@createOrg
Feature: Create Organisation

  Background: Register an Organisation
    Given I register a new organisation

  Scenario: Approve New Organisation
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the home page title appear
    When I click first organization view link
    Then I see "Approve organisation" on organisation details page
    And I see the organisation state as "PENDING"
    When I select approve organisation
    Then I am on confirm decision page
    When I confirm the decision
    Then I get a registration confirmation
    When I select "Active organisations" tab
    And I search for the organisation
    Then I can see the orgainsation listed
    When I click first organization view link
    Then I see "Organisation details" on organisation details page
    And I see the organisation state as "ACTIVE"
