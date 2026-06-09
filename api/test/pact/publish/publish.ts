import { spawn } from 'child_process';
import * as git from 'git-rev-sync';
import * as path from 'path';

import { getConfigValue } from '../../../configuration';
import {
  PACT_BRANCH_NAME,
  PACT_BROKER_PASSWORD,
  PACT_BROKER_URL,
  PACT_BROKER_USERNAME,
  PACT_CONSUMER_VERSION
} from '../../../configuration/references';

const addOptionalArg = (args: string[], name: string, value: string): void => {
  if (value) {
    args.push(name, value);
  }
};

const runPactBrokerPublish = (args: string[]): Promise<void> => new Promise((resolve, reject) => {
  const child = spawn('pact-broker', args, {
    shell: process.platform === 'win32',
    stdio: 'inherit'
  });

  child.on('error', reject);

  child.on('close', (code, signal) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(signal
      ? `pact-broker publish was terminated by signal ${signal}`
      : `pact-broker publish exited with code ${code}`));
  });
});

const publish = async (): Promise<void> => {
  function getPactBrokerURL() {
    return getConfigValue(PACT_BROKER_URL).includes('localhost') ? getConfigValue(PACT_BROKER_URL)
      : `https://${getConfigValue(PACT_BROKER_URL)}`;
  }
  try {
    const pactBroker = getConfigValue(PACT_BROKER_URL) ? getPactBrokerURL() : 'http://localhost:80';

    const pactTag = getConfigValue(PACT_BRANCH_NAME) ?
      getConfigValue(PACT_BRANCH_NAME) : 'Dev';

    const consumerVersion = getConfigValue(PACT_CONSUMER_VERSION) !== '' ?
      // @ts-ignore
      getConfigValue(PACT_CONSUMER_VERSION) : git.short();

    const opts = {
      consumerVersion,
      pactBroker,
      pactBrokerPassword: getConfigValue(PACT_BROKER_PASSWORD),
      pactBrokerUsername: getConfigValue(PACT_BROKER_USERNAME),
      pactFilesOrDirs: [
        path.resolve(__dirname, '../pacts/')
      ],
      tags: [pactTag]
    };

    const pactBrokerArgs = [
      'publish',
      ...opts.pactFilesOrDirs,
      '--consumer-app-version',
      opts.consumerVersion,
      '--broker-base-url',
      opts.pactBroker,
      '--tag',
      pactTag,
      '--log-level',
      process.env.LOG_LEVEL || 'error'
    ];

    addOptionalArg(pactBrokerArgs, '--broker-username', opts.pactBrokerUsername);
    addOptionalArg(pactBrokerArgs, '--broker-password', opts.pactBrokerPassword);

    await runPactBrokerPublish(pactBrokerArgs);

    console.log(`Pact contract publishing complete!

    Head over to ${pactBroker}
    to see your published contracts.`);
  } catch (e) {
    console.log('Pact contract publishing failed: ', e);
  }
};

(async () => {
  await publish();
})();
