@functional_enabled @functional_debug
Feature: Organisation Decison workflow

  Background:
    When I navigate to EUI Approve Organisation Url
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    When I search for organisation with input "test"


  Scenario Outline: Verify the confirmation screen of Approve Organisation
    Then I click first organization view link
    Then I validate pending organisation details page
    When I select option "<selectOption>" for pending organisation and submit
    Then I see pending organisation decision "<decision>" confirm page
    When I click confirm in pending organisation decision confirm page
    Then I see organisations list page with messge banner ""
    Examples:
      | selectOption       | decision |bannerMessage|
      | Approve it | Approve the organisation | Registration approved |
      | Reject it | Reject the registration | Registration rejected |
      | Place registration under review pending further investigation | Put the registration on hold |  |