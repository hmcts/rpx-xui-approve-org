'use strict';
const { Before, After } = require('@cucumber/cucumber');

const CucumberReportLog = require('../../e2e/support/CucumberReporter');

const MockApp = require('../../nodeMock/app');

Before(function (scenario) {
  MockApp.init();
  CucumberReportLog.setScenarioWorld(this);
  // done();
});

After(async function (scenario) {
  await MockApp.stopServer();
  CucumberReportLog.AddMessage('NG Integration test status : ' + scenario.result.status);
  // done();
});

