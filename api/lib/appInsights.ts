import * as applicationinsights from 'applicationinsights'
import * as express from 'express'
import {getConfigValue, getEnvironment} from '../configuration'
import {APP_INSIGHTS_ENABLED, APP_INSIGHTS_KEY} from '../configuration/references'

export let client

if (getConfigValue(APP_INSIGHTS_ENABLED)) {
    applicationinsights
        .setup(getConfigValue(APP_INSIGHTS_KEY))
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setSendLiveMetrics(true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(true)
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
