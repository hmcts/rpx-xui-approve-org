@smoke
Feature: Validate App is up and running afetr deployment
 
    Scenario: Redirect to idam login page on accessing application URL
        When I navigate to EUI Approve Organisation Url
        Then I am on Idam login page
       