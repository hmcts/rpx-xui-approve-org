import pact from '@pact-foundation/pact-node'
import * as git from 'git-rev-sync'
import * as path from 'path'
import {getConfigValue} from '../../../configuration'
import {PACT_BROKER_PASSWORD, PACT_BROKER_USERNAME, PACT_CONSUMER_VERSION} from '../../../configuration/references'

const publish = async (): Promise<void> => {
    try {

        const pactBroker = 'http://localhost:80'

        const consumerVersion = getConfigValue(PACT_CONSUMER_VERSION) !== '' ?
            // @ts-ignore
            getConfigValue(PACT_CONSUMER_VERSION) : git.short()

        const opts = {
            consumerVersion,
            pactBroker,
            pactBrokerPassword: getConfigValue(PACT_BROKER_PASSWORD),
            pactBrokerUsername: getConfigValue(PACT_BROKER_USERNAME),
            pactFilesOrDirs: [
                path.resolve(__dirname, '../pacts/'),
            ],
            tags: ['xui', 'oidc', 'oauth2', 'Dev'],
        }

        await pact.publishPacts(opts)

        console.log('Pact contract publishing complete!')
        console.log('')
        console.log(`Head over to ${pactBroker}`)
        console.log('to see your published contracts.')

    } catch (e) {
        console.log('Pact contract publishing failed: ', e)
    }
}

(async () => {
    await publish()
})()
