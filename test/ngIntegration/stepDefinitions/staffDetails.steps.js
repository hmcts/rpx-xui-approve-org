
var { defineSupportCode } = require('cucumber');

const MockApp = require('../../nodeMock/app');

const staffDetailsMockData = require('../../nodeMock/staffDetails/mockData');
const browserUtil = require('../util/browserUtil');

const headerpage = require('../../e2e/features/pageObjects/headerPage');
const cucumberReporter = require('../../e2e/support/CucumberReporter');

defineSupportCode(function ({ And, But, Given, Then, When }) {

    Given('I set MOCK upload error status {int}', async function (statusCode) {
        MockApp.onPost('/api/caseworkerdetails', (req,res) => {
            cucumberReporter.AddMessage("Staff details upload request received by Mock app. Returning error "+statusCode);
            res.status(statusCode).send(staffDetailsMockData.getErrorResponse(statusCode.toString()));
        });
    });


    Given('I set MOCK upload success', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            cucumberReporter.AddMessage("Staff details upload request received by Mock app. Returning success");
            res.status(200).send(staffDetailsMockData.getSuccess());
        });
    });


    Given('I set MOCK upload partial success', async function () {
        MockApp.onPost('/api/caseworkerdetails', (req, res) => {
            cucumberReporter.AddMessage("Staff details upload request received by Mock app. Returning partial success ");
            res.status(200).send(staffDetailsMockData.getPartialSuccess());
        });
    });

});
