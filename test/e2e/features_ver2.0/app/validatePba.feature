@2.0_test @fullfunctional @validate_pba
Feature: PBA Validation

  Background: 
    Given I register a new organisation
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    Then I Check the home page title appear
    When I click first organization view link
    Then I see "Approve organisation" on organisation details page
    And I see the organisation state as "PENDING"

  Scenario: Validate change PBA in Pending state Organisation
    When I navigate to change PBA page for PBA 1
    Then I am on change PBA page
    When I change PBA 1
    Then I validate PBA details for PBA 1
    When I navigate to change PBA page for PBA 2
    Then I am on change PBA page
    When I change PBA 2
    Then I validate PBA details for PBA 2

  Scenario: Validate change PBA in Active state Organisation
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
    When I navigate to change PBA page for PBA 1
    Then I am on change PBA page
    When I change PBA 1
    Then I validate PBA details for PBA 1
    When I navigate to change PBA page for PBA 2
    Then I am on change PBA page
    When I change PBA 2
    Then I validate PBA details for PBA 2

  Scenario: Validate add PBA in Pending state Organisation
    When I navigate to change PBA page for PBA 1
    Then I am on change PBA page
    And I add PBA 3
    Then I validate PBA details for PBA 3
    When I navigate to change PBA page for PBA 3
    Then I am on change PBA page
    And I add PBA 4
    Then I validate PBA details for PBA 4

  Scenario: Validate add PBA in Active state Organisation
    When I select approve organisation
    Then I am on confirm decision page
    When I confirm the decision
    Then I get a registration confirmation
    When I select "Active organisations" tab
    And I search for the organisation
    Then I can see the orgainsation listed
    When I click first organization view link
    Then I see "Organisation details" on organisation details page
    When I navigate to change PBA page for PBA 1
    Then I am on change PBA page
    And I add PBA 3
    Then I validate PBA details for PBA 3
    When I navigate to change PBA page for PBA 3
    Then I am on change PBA page
    And I add PBA 4
    Then I validate PBA details for PBA 4
