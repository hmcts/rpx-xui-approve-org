Feature: Search Organisation

    Background:
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with HMCTS admin
        Then I should be redirected to approve organisation dashboard page

@fullfunctional @crossbrowser
    Scenario: Verify search with Organisation name, Pending organisation
        Then I search with organisation name and validate results


    Scenario: Verify search with Organisation name, active organisations
        Then I Verify the Active Organisations Tab
        Then I click on Active Organisations Tab to redirect to Active Organisations page
        Then I search with organisation name and validate results

