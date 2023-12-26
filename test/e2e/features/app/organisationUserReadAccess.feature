@functional_enabled
Feature: Verify access to User tab for prd admin users
    Scenario: Verify access to active Organisation User tab for approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page

        When I click sub navigation tab "Active organisations" in organisation list page
        Then I see Organisations list page with sub navigation page "Active organisations"
        Then I click first organization view link
        Then I see organisation details page with registration status "ACTIVE"
       
        Then I validate active organisation details page displayed
        Then I validate organisation details page displayed with header "Organisation details"
        When I click sub navigation tab "Users" in organisation details page
        Then I validate organisation details page displayed with header "Users"
        When I click sub navigation tab "Organisation details" in organisation details page
        Then I validate organisation details page displayed with header "Organisation details"


    Scenario: Verify access to pending Organisation User tab for approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with approver prd admin
        Then I should be redirected to approve organisation dashboard page

        Then I see Organisations list page with sub navigation page "New registrations"
        Then I click first organization view link
        Then I see organisation details page with registration status "PENDING"
        Then I validate organisation details page displayed with header "Approve organisation"
        Then I validate organisation details page sub navigation tabs not displayed

    Scenario: Verify access to active Organisation User tab for non approver user
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with non approver prd admin
        Then I should be redirected to approve organisation dashboard page

        When I click sub navigation tab "Active organisations" in organisation list page
        Then I see Organisations list page with sub navigation page "Active organisations"
        Then I click first organization view link
        Then I see organisation details page with registration status "ACTIVE"
       
        Then I validate active organisation details page displayed
        Then I validate organisation details page displayed with header "Organisation details"
        Then I validate organisation details page sub navigation tabs not displayed

