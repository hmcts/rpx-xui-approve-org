'use strict';

const { SHORT_DELAY, MID_DELAY, LONG_DELAY } = require('../../support/constants');
const browserWaits = require('../../support/customWaits');

function HeaderPage() {

  this.aoPage = element(by.xpath("//a[contains(text(),'Approve organisations')]"));
  this.aoPage = element(by.css("[id='validation-error-summary-heading']"));
  this.signOut = element(by.xpath("//a[contains(text(),'Sign out')]"));

  this.primaryNavListContainer = $('.hmcts-primary-navigation .hmcts-primary-navigation__list');
  this.primaryNavItems = $$('.hmcts-primary-navigation .hmcts-primary-navigation__list .hmcts-primary-navigation__item a');


  this.clickSignOut = function () {
    this.signOut.click();
    browser.sleep(SHORT_DELAY);
  };

  this.waitForPrimaryNavDisplay = async function(){
    await browserWaits.waitForElement(this.primaryNavListContainer);
  }

  this.getTabsDisplayed = async function(){
    await browserWaits.waitForElement(this.primaryNavListContainer);
    let tabsCount = await this.primaryNavItems.count();
    // return await this.primaryNavItems.getText();
    const tabs = [];
    for (let tabCounter = 0; tabCounter < tabsCount; tabCounter++){
      tabs.push(await this.primaryNavItems.get(tabCounter).getText()); 
    } 
    return tabs;
  }

  this.getTabElement = async function(tabDisplayLabel){
    await browserWaits.waitForElement(this.primaryNavListContainer);
    let tabsCount = await this.primaryNavItems.count();
    // return await this.primaryNavItems.getText();
    let returnTabElement = null;
    for (let tabCounter = 0; tabCounter < tabsCount; tabCounter++) {
      let tabLabel = await this.primaryNavItems.get(tabCounter).getText();
      if (tabLabel === tabDisplayLabel){
        returnTabElement = await this.primaryNavItems.get(tabCounter);
        break; 
      }
    }
    return returnTabElement;
  }

  this.clickTab = async function(tabLabel){
    let tabElement = await this.getTabElement(tabLabel);
    expect(tabElement, `Tab with label "${tabLabel}" is not present`).to.be.not.null;
    await tabElement.click();
  }

  this.isTabDisplayed = async function(tabName){
    const tabs = await this.getTabsDisplayed();
    return tabs.includes(tabName); 
  }

}

module.exports = new HeaderPage;
