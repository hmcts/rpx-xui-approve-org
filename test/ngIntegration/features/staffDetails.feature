
@ng
Feature: Staff details upload file

    Background: Start Mock app
        Given I start MockApp

 
    Scenario: Upload file not selected
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I click upload button in Staff details upload page
        Then I see error message banner in staff details page
        Then I see staff details banner with error message "You need to select a file to upload. Please try again"


    Scenario: Upload file success
        Given I set MOCK upload success
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page

        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details upload success page

    Scenario: Upload file partial success
        Given I set MOCK upload partial success
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details upload partial success page

    Scenario: Upload file 500 errors
        Given I set MOCK upload error status 500
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details service down page

    Scenario: Upload file 401 errors
        Given I set MOCK upload error status 401
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details unauthorised error page

    Scenario: Upload file 403 errors
        Given I set MOCK upload error status 403
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details unauthorised error page


    Scenario: Upload file 400 errors
        Given I set MOCK upload error status 400
        Given I restart MockApp
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
        Given I navigate to home page
        Then I see Staff details upload page displayed
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see error message banner in staff details page


