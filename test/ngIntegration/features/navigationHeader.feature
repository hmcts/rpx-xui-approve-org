
@ng
Feature: Navigation header tabs

    Background: Start Mock app
        Given I start MockApp

    Scenario: Header Tabs for prd-admin only
        Given I set MOCK with user roles
            | role      |
            | prd-admin |

        Given I navigate to home page
        Then I see primary navigation tab "Organisations" in header
        Then I do not see primary navigation tab "Staff details" in header

    Scenario: Header Tabs for cwd-admin only
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |

        Given I navigate to home page
        Then I do not see primary navigation tab "Organisations" in header
        Then I see primary navigation tab "Staff details" in header

    Scenario: Header Tabs for prd-admin and cwd-admin
        Given I set MOCK with user roles
            | role      |
            | cwd-admin |
            | prd-admin |
        Given I navigate to home page
        Then I see primary navigation tab "Organisations" in header
        Then I see primary navigation tab "Staff details" in header
