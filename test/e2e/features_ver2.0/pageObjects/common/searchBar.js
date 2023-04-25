'use strict';

function SearchBar() {
  this.searchField = $('#search');
  this.searchButton = element(by.xpath('//button[contains(text(),"Search")]'));
  this.resetButton = element(by.xpath('//button[contains(text(),"Reset")]'));
}

module.exports = new SearchBar();
