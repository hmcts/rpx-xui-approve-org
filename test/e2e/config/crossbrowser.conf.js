const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

const config = {
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  specs: ['../features/**/*.feature'],
  baseUrl: (process.env.TEST_URL || 'http://localhost:3000').replace('https', 'http'),
  params: {
    serverUrls: process.env.TEST_URL || 'http://localhost:3000',
    targetEnv: argv.env || 'local',
    //username: process.env.TEST_EMAIL,
    //password: process.env.TEST_PASSWORD,
    username: 'vmuniganti@mailnesia.com',
    password: 'Monday01'
  },
  getPageTimeout: 120000,
  allScriptsTimeout: 500000,
  multiCapabilities: [
    {
      browserName: 'chrome',
      version: 'latest',
      platform: 'Windows 10',
      name: 'chrome-win-tests',
      tunnelIdentifier: 'reformtunnel',
      extendedDebugging: true,
      sharedTestFiles: false,
      maxInstances: 1
    },

    {
      browserName: 'firefox',
      version: 'latest',
      platform: 'Windows 10',
      name: 'firefox-tests',
      tunnelIdentifier: 'reformtunnel',
      extendedDebugging: true,
      sharedTestFiles: false,
      maxInstances: 1
    },

    {
      browserName: 'MicrosoftEdge',
      platform: 'macOS 10.15',
      version: '90.0',
      name: 'chromium-tests',
      tunnelIdentifier: 'reformtunnel',
      extendedDebugging: true,
      sharedTestFiles: false,
      maxInstances: 1
    },

    {
      browserName: 'chrome',
      version: 'latest',
      platform: 'macOS 10.15',
      name: 'chrome-mac-tests',
      tunnelIdentifier: 'reformtunnel',
      extendedDebugging: true,
      sharedTestFiles: false,
      maxInstances: 1
    },

    {
      browserName: 'firefox',
      version: 'latest',
      platform: 'macOS 10.15',
      name: 'ff-mac-tests',
      tunnelIdentifier: 'reformtunnel',
      extendedDebugging: true,
      sharedTestFiles: false,
      maxInstances: 1
    }
  ],

  onPrepare() {
    const caps = browser.getCapabilities();
    browser.manage()
      .window()
      .maximize();
    browser.waitForAngularEnabled(false);
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should;
  },

  cucumberOpts: {
    strict: true,
    format: ['json:cb_reports/saucelab_results.json'],
    require: ['../support/world.js', '../support/*.js', '../features/step_definitions/**/*.steps.js'],
    tags: ['@crossbrowser', 'not @Flaky']
  },

  plugins: [
    {
      package: 'protractor-multiple-cucumber-html-reporter-plugin',
      options: {
        automaticallyGenerateReport: true,
        removeExistingJsonReportFile: true,
        reportName: 'XUI AO CrossBrowser Tests',
        jsonDir: 'reports/tests/crossbrowser',
        reportPath: 'reports/tests/crossbrowser'

      }
    }
  ],

  sauceSeleniumAddress: 'ondemand.eu-central-1.saucelabs.com:443/wd/hub',

  host: 'ondemand.eu-central-1.saucelabs.com',
  sauceRegion: 'eu',
  port: 80,
  sauceConnect: true,

  // sauceProxy: 'http://proxyout.reform.hmcts.net:8080',  // Proxy for the REST API
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  SAUCE_REST_ENDPOINT: 'https://eu-central-1.saucelabs.com/rest/v1/',

  useAllAngular2AppRoots: true,

  exclude: []
};

exports.config = config;
