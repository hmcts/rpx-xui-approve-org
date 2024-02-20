@functional_enabled 
Feature: Organisations List page

    Background:
        When I navigate to EUI Approve Organisation Url
        Given I am logged into approve organisation with HMCTS admin
        Then I should be redirected to approve organisation dashboard page

    @fullfunctional @crossbrowser @flaky
    Scenario Outline: Scenario Outline name: Sun navigation tabs display
        When I click sub navigation tab "<Tab>" in organisation list page
        Then I see Organisations list page with sub navigation page "<Header>"
        Then I click first organization view link
        Then I see organisation details page with registration status "<Status>"
        Examples:
            | Tab                  | Header               | Status |
            | New registrations | New registrations | PENDING |
            | Active organisations | Active organisations |   ACTIVE     |

    Scenario Outline: Verify search
        When I click sub navigation tab "<Tab>" in organisation list page

        When I search for organisation with input "<SearchInput>"
        Then I validate search results field "<SearchField>" contains "<SearchInput>"
        Examples:
            | Tab                  | Header               | SearchField | SearchInput |
            | New registrations | New registrations | Organisation | EXUI |
            | Active organisations | Active organisations | Organisation | test |
            | New registrations | New registrations | Address | SE15TY |

