 
Feature: Verify access to User tab for prd admin users

@all
    Scenario: Verify access to active Organisation User tab for non approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs not displayed

@all
    Scenario: Verify access to active Organisation User tab for approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
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
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
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
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "PENDING"
        Then I see sub navigation tabs not displayed

    Scenario: Verify access to pending Organisation User tab for non approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "PENDING"
        Then I see sub navigation tabs not displayed

    Scenario: Verify bug EUI-1762 is fixed
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs not displayed
        When I select the sign out link
        Then I should be redirected to the Idam login page

        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs displayed
        Then I see sub navigation tab "Users" displayed
        Then I see sub navigation tab "Organisation Details" displayed
        When I select the sign out link
        Then I should be redirected to the Idam login page

        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page
        Then I Check the active Organisation banner appear
        Then I Verify the Check Now Link
        Then I click on Check Now Link to redirect to Active Organisations page
        Then I click first organization view link
        Then I am on organisation page
        Then I see organisation status is "ACTIVE"
        Then I see sub navigation tabs not displayed
       