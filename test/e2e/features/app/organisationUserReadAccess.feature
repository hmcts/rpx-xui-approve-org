Feature: Verify access to User tab for prd admin users
    Scenario: Verify access to active Organisation User tab for approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Verify the Active Organisations Tab
        Then I click on Active Organisations Tab to redirect to Active Organisations page
        Then I search with organisation name and validate results
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs displayed
        Then I see sub navigation tab "Users" displayed
        Then I see sub navigation tab "Organisation Details" displayed

    Scenario: Vealidate Active organisation Sub navigation tabs and content displayed for approver prd admin
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Verify the Active Organisations Tab
        Then I click on Active Organisations Tab to redirect to Active Organisations page
        Then I search with organisation name and validate results
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs displayed
        Then I see sub navigation tab "Users" displayed
        Then I see sub navigation tab "Organisation Details" displayed
        Then I click organisation details tab
        Then I see organisation details displayed
        Then I click users details tab
        Then I see users details displayed

    Scenario: Verify access to pending Organisation User tab for approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Verify the Active Organisations Tab
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "PENDING"
        Then I see sub navigation tabs not displayed

    Scenario: Verify access to active Organisation User tab for non approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Verify the Active Organisations Tab
        Then I click on Active Organisations Tab to redirect to Active Organisations page
        Then I search with organisation name and validate results
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs not displayed

    Scenario: Verify access to pending Organisation User tab for non approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Verify the Active Organisations Tab
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "PENDING"
        Then I see sub navigation tabs not displayed
