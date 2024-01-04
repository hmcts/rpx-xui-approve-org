
const AppActions = require('../helpers/applicationActions');
const PallyActions = require('../helpers/pallyActions');

const assert = require('assert');
const { pa11ytest, getResults, pa11yTestUserRoles } = require('../helpers/pa11yUtil');
const { conf } = require('../config/config');

const MockApp = require('../../nodeMock/app');

describe('Delete Organisation', function () {
  beforeEach(function () {
    
  });
  afterEach(async function (done) {
    // await MockApp.stopServer();
    done();
  });

  function getOrgDeleteButtonCss(orgStatus){
    return orgStatus === 'ACTIVE' ? 'app-org-details-info .govuk-button' : 'app-org-details-info .delete-org-button';
  }

  ['PENDING', 'ACTIVE'].forEach((state) => {
    xit(state+' Org Delete registration request Page', async function () {
      // MockApp.onGet('/api/organisations/:OrgId/isDeletable', (req, res) => {
      //   res.send({ 'organisationDeletable': true });
      // });
      // await MockApp.startServer();
      const actions = [];

      if (state === 'ACTIVE'){
        actions.push(...PallyActions.waitForPageWithCssLocator('.pending-organisations'));
        actions.push(...PallyActions.clickElement('.govuk-tabs__list li:nth-of-type(3) a'));
        actions.push(...PallyActions.waitForPageWithCssLocatorNotPresent('.pending-organisations'));
        actions.push(...PallyActions.waitForPageWithCssLocator('.active-organisations'));
        actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));

        //    actions.push(...PallyActions.navigateTourl(conf.baseUrl + 'approve-organisations'));
      }
      actions.push(...PallyActions.waitForPageWithCssLocator('td>a'));
      actions.push(...PallyActions.clickElement('td>a'));
      actions.push(...PallyActions.waitForPageWithCssLocator('app-org-details-info'));

      actions.push(...PallyActions.clickElement(getOrgDeleteButtonCss(state)));
      actions.push(...PallyActions.waitForPageWithCssLocator('app-org-pending-delete h1'));
      await pa11ytest(this, actions);
    });
  });

});

