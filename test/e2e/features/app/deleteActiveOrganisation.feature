@functional_enabled
Feature: Delete Organisation

  Background:
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page


@all_deprecated @fullfunctional_deprecated
  Scenario: Verify Delete active organisation

    When I search for organisation with input "test"
    Then I validate search results field "Organisation" contains "test"

    Then I click first organization view link
    Then I see organisation details page with registration status "PENDING"

    Then I validate pending organisation details page

    Given I save page url with reference "org_to_approve"

    When I select option "Approve it" for pending organisation and submit
    Then I see pending organisation decision "Approve the organisation" confirm page
    When I click confirm in pending organisation decision confirm page
    Then I see organisations list page with messge banner "Registration approved"

    Given I navigate to url with ref "org_to_approve"

    Then I see organisation details page with registration status "ACTIVE"

    When I click delete organisation button in organisation details page
    Then I see pending organisation decision "Reject the registration" confirm page
    When I click Delete organisation button organisation decision confirm page
    Then I see confirmation page with message containing "has been deleted"