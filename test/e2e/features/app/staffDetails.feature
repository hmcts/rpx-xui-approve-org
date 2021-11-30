
@fullfunctiona__
Feature: Staff details upload

    Background:
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with CWD admin
        Then I should be redirected to approve organisation dashboard page
        When I click navigation tab Staff details

        Then I see Staff details upload page displayed

    Scenario: Verify search with Organisation name, Pending organisation
        When I select file to upload Staff details
        When I click upload button in Staff details upload page
        Then I see Staff details upload success process page


