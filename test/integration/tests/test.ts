process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import * as Mocha from 'mocha';
import * as tunnel from '../../../api/lib/tunnel';
import {config} from '../config';


if (config.proxy) {
  tunnel.init();
}

// tunnel.init();

const mocha = new Mocha({
     ui: 'tdd',
    // reporter: 'spec',
   // bail: 'yes',
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'reports/tests/api_functional/',
        reportName: 'XUI_AO_Integration_tests'
    }
});

mocha.addFile('test/integration/tests/get_Pending_Organisations.ts');
mocha.addFile('test/integration/tests/get_Active_Organisations.ts');
mocha.addFile('test/integration/tests/get_PBA_Account_names.ts');
mocha.addFile('test/integration/tests/get_Organisation_User_Details.ts');
mocha.addFile('test/integration/tests/post_Invite_User.ts');
mocha.addFile('test/integration/tests/Approve_Pending_Organisations.ts');
// mocha.addFile('test/integration/tests/post_Update_PBA.ts');

mocha.run( (failures) => {
    process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
});
