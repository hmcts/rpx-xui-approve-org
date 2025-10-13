'use strict';

const idamLogin = require('./idamLogin');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function gotoHomePage() {
  await browser.get(BASE_URL);
}

async function waitForLD() {
  // Lightweight wait to allow client-side flags/resources to settle
  await browser.sleep(1);
}

async function browserInitWithAuth(/* roles */) {
  // Minimal implementation: navigate to app entrypoint. Tests using real auth
  // can extend this to set cookies via idamLogin if needed.
  await gotoHomePage();
}

module.exports = {
  gotoHomePage,
  waitForLD,
  browserInitWithAuth
};


