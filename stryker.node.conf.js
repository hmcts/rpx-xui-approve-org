require('dotenv-extended').load({ path: 'api/.env.defaults' });
module.exports = {
        fileLogLevel: 'trace',
        // logLevel: 'trace',
        mutate: ["api/**/*.ts", "!api/**/*.spec.ts", "!api/test/**/*.ts"],
        mutator: 'typescript',
        // transpilers: [
        //     'typescript'
        // ],
        testFramework: "mocha",
        testRunner: "mocha",
        reporters: ["clear-text", "progress", "html"],
        tsconfigFile: 'tsconfig.json',
        mochaOptions: {
            spec: ["api/{,!(test)/**/}*.spec.ts"],
            require: ['ts-node/register']
        },
        htmlReporter: {
            baseDir: 'reports/tests/mutation/node/'
        }
} 
