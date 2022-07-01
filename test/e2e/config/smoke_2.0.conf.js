const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const minimist = require('minimist');

chai.use(chaiAsPromised);

const argv = minimist(process.argv.slice(2));

//const specFilesFilter = ['../features/**/*.feature'];

// module.exports = {
//   chai: chai,
//   chaiAsPromised: chaiAsPromised,
//   minimist: minimist,
//   argv: argv,
//   specFilesFilter: specFilesFilter
// }
//

const jenkinsConfig = [

  {
    browserName: 'chrome',
    acceptInsecureCerts: true,
    nogui: true,
    chromeOptions: { args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-zygote ', '--disableChecks'] }
  }
];

const localConfig = [
  {
    browserName: 'chrome',
    acceptInsecureCerts: true,
    chromeOptions: { args: ['--headless1', '--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-zygote '] },
    proxy: {
      proxyType: 'manual',
      //httpProxy: 'proxyout.reform.hmcts.net:8080',
      sslProxy: 'proxyout.reform.hmcts.net:8080',
      noProxy: 'localhost:3000'
    }
  }
];

const cap = (argv.local) ? localConfig : jenkinsConfig;

const config = {
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  specs: ['../features_ver2.0/**/*.feature'],
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  params: {
    serverUrls: process.env.TEST_URL || 'http://localhost:3000',
    targetEnv: argv.env || 'local',
    username: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD,
    approver_username: 'vamshiadminuser@mailnesia.com',
    approver_password: 'Testing123',
    fr_judge_username: process.env.FR_EMAIL,
    fr_judge_password: process.env.FR_PASSWORD,
    sscs_username: process.env.SSCS_EMAIL,
    sscs_password: process.env.SSCS_PASSWORD

  },
  directConnect: true,
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  getPageTimeout: 120000,
  allScriptsTimeout: 500000,
  multiCapabilities: cap,

  onPrepare() {
    browser.waitForAngularEnabled(false);
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should;
  },

  cucumberOpts: {
    strict: true,
    // format: ['node_modules/cucumber-pretty'],
    format: ['node_modules/cucumber-pretty', 'json:reports_json/results_smoke.json'],
    tags: ['@fullfunctional'],
    require: [
      '../support/timeout.js',
      '../support/world.js',
      '../support/*.js',
      '../features_ver2.0/step_definitions/steps/*.steps.js'
    ]
  },

  plugins: [
    {
      package: 'protractor-multiple-cucumber-html-reporter-plugin',
      options: {
        automaticallyGenerateReport: true,
        removeExistingJsonReportFile: true,
        reportName: 'EXUI AO UI Smoke Tests',
        // openReportInBrowser: true,
        jsonDir: 'reports/tests/smoke',
        reportPath: 'reports/tests/smoke'
      }
    }
  ]


};


exports.config = config;
