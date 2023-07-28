// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { addMatchers, getTestScheduler, initTestScheduler, resetTestScheduler } from 'jasmine-marbles';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// configure matchers for jasmine-marbles
jasmine.getEnv().beforeAll(() => {
  return addMatchers();
});

jasmine.getEnv().beforeEach(() => {
  initTestScheduler();
});

jasmine.getEnv().afterEach(() => {
  getTestScheduler().flush();
  resetTestScheduler();
});

// Then we find all the tests.
console.log('--------------------------');
console.log(require);
// context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
// context.keys().map(context);
