
Feature: Search Organisation

    Background:
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with HMCTS admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear

    @all
    Scenario: Verify search with Organisation name, Pending organisation 
        Then I search with organisation name and validate results


    @all
    Scenario: Verify search with Organisation name, active organisations
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
        Then I search with organisation name and validate results
        
