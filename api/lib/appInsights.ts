import * as applicationinsights from 'applicationinsights'
import * as express from 'express'
import config, {isLocal} from './config'

export let client

// shouldnt do this check here but this is a high level dep

if (!isLocal()) {
    console.log('config.appInsightsInstrumentationKey is ' + config.appInsightsInstrumentationKey)
    applicationinsights
        .setup(config.appInsightsInstrumentationKey)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start()

    client = applicationinsights.defaultClient
    client.trackTrace({ message: 'App Insight Activated' })

} else {
    client = null
}

export function appInsights(req: express.Request, res: express.Response, next) {
    if (client) {
        client.trackNodeHttpRequest({ request: req, response: res })
    }

    next()
}
