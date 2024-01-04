@functional_enabled
Feature: Organisation Decison workflow

  Background:
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
   


  Scenario Outline: Verify the confirmation screen of Approve Organisation
    Then I click first organization view link
    Then I validate pending organisation details page
    When I select option "<selectOption>" for pending organisation and submit
    Then I see pending organisation decision "<decision>" confirm page
    # When I click confirm in pending organisation decision confirm page
    Then I click confirm in pending organisation decision confirm page to see success banner message "<bannerMessage>"
    # Then I see organisations list page with messge banner "<bannerMessage>"
    Examples:
      | selectOption       | decision |bannerMessage|
      | Approve it | Approve the organisation | Registration approved |
      | Reject it | Reject the registration | Registration rejected |
      | Place registration under review pending further investigation | Put the registration on hold | Registration put under review |



  @all_deprecated @fullfunctional_deprecated
  Scenario: Verify Reject after under review status - EUI-8128
    Then I see Organisations list page with sub navigation page "New registrations"
    When I search for organisation with input "test"
    Then I validate search results field "Organisation" contains "test"

    Then I click first organization view link
    Then I see organisation details page with registration status "PENDING"

    Then I validate pending organisation details page

    Given I save page url with reference "org_to_reject"

    When I select option "Place registration under review pending further investigation" for pending organisation and submit
    Then I see pending organisation decision "Put the registration on hold" confirm page
    When I click confirm in pending organisation decision confirm page
    Then I see organisations list page with messge banner "Registration put under review"

    Given I navigate to url with ref "org_to_reject"

    When I select option "Reject it" for pending organisation and submit
    Then I see pending organisation decision "Reject the registration" confirm page
    When I click confirm in pending organisation decision confirm page
    Then I see organisations list page with messge banner "Registration rejected"