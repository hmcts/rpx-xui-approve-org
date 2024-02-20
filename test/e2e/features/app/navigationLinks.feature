@functional_enabled 
Feature: Navigation links

    Background:
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with HMCTS admin
        Then I should be redirected to approve organisation dashboard page

    @fullfunctional @crossbrowser @flaky
    Scenario: Back link navigation from Pending Organisation details page
        Then I see Organisations list page with sub navigation page "New registrations"
        Then I click first organization view link
        Then I see organisation details page with registration status "PENDING"

        When I click back link in organisation details page
        Then I see Organisations list page with sub navigation page "New registrations"

    Scenario: Back link navigation from Active Organisation details page
        Then I see Organisations list page with sub navigation page "New registrations"
        When I click sub navigation tab "Active organisations" in organisation list page
        Then I see Organisations list page with sub navigation page "Active organisations"
        Then I click first organization view link
        Then I see organisation details page with registration status "ACTIVE"

        When I click back link in organisation details page
        Then I see Organisations list page with sub navigation page "Active organisations"
        
    Scenario: Back link from approve org page confirm page
        Then I see Organisations list page with sub navigation page "New registrations"
        Then I click first organization view link
        Then I validate pending organisation details page
        When I select option "Approve it" for pending organisation and submit
        Then I see pending organisation decision "Approve the organisation" confirm page
       
        When I click back link from confirm decision page
        Then I validate pending organisation details page

        When I click back link in organisation details page
        Then I see Organisations list page with sub navigation page "New registrations"

    Scenario: Back link from Delete org page confirm page
        Then I see Organisations list page with sub navigation page "New registrations"
        When I click sub navigation tab "Active organisations" in organisation list page
        Then I see Organisations list page with sub navigation page "Active organisations"
        Then I click first organization view link
        Then I validate active organisation details page displayed
       
        When I click delete organisation button in organisation details page
        Then I see pending organisation decision "Reject the registration" confirm page
        When I click back link from confirm decision page
        Then I validate active organisation details page displayed

        When I click back link in organisation details page
        Then I see Organisations list page with sub navigation page "Active organisations"

    Scenario: Valdate Pending organisation details page after visiying Active organisations Users page - EUI-8223
        Then I see Organisations list page with sub navigation page "New registrations"
        When I click sub navigation tab "Active organisations" in organisation list page
        Then I see Organisations list page with sub navigation page "Active organisations"
        Then I click first organization view link
        Then I validate active organisation details page displayed

        When I click sub navigation tab "Users" in organisation details page
        Then I validate organisation details page displayed with header "Users"

        When I click back link in organisation details page
        Then I see Organisations list page with sub navigation page "Active organisations"

        When I click sub navigation tab "New registrations" in organisation list page
        Then I see Organisations list page with sub navigation page "New registrations"

        Then I click first organization view link
        Then I validate pending organisation details page


       