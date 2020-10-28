Feature: Login

  Background:
    When I navigate to EUI Approve Organisation Url
  @fullfunctional
  Scenario: un-authenticated user login
    Then I am on Idam login page
    When I enter an Invalid email-address and password to login
    Then I should be redirected to the Idam login page
    Then I should see failure error summary

  @fullfunctional @crossbrowser
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    When I select the sign out link
    Then I should be redirected to the Idam login page


  Scenario: login and log out from approve organisation as FR user
    Given I am logged into approve organisation with FR judge details
    Then I should be redirected to approve organisation dashboard page
    When I select the sign out link
    Then I should be redirected to the Idam login page


  @fullfunctional
  Scenario: Verify the direct link navigate to login page
    Given I navigate to approve organisation Url direct link
    Then I should be redirected back to Login page after direct link



@FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page



  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page

  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page

  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page

  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page


  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
 
  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page


  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
  
  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page

  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page

  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
    
  @FirstAttemptLogin
  Scenario: login and log out from approve organisation as HMCTS Admin user
    Given I am logged into approve organisation with HMCTS admin
    Then I should be redirected to approve organisation dashboard page
