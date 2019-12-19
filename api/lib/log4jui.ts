import * as log4js from 'log4js'
import { getConfigProp } from '../configuration'
import { LOGGING } from '../configuration/references'
import * as errorStack from '../lib/errorStack'
import { client } from './appInsights'

let logger = null

// This is done to mimic log4js calls

export function getLogger(category: string) {
    logger = log4js.getLogger(category)
    logger.level = getConfigProp(LOGGING) || 'off'

    return {
        _logger: logger,
        debug,
        error,
        info,
        trackRequest,
        warn,
    }
}

function info(...messages: any[]) {
    let fullMessage = ''

    for (const message of messages) {
        fullMessage += message
    }

    const category = this._logger.category
    if (client) {
        client.trackTrace({ message: `[INFO] ${category} - ${fullMessage}` })
    }
    this._logger.info(fullMessage)
}

function warn(...messages: any[]) {
    let fullMessage = ''

    for (const message of messages) {
        fullMessage += message
    }

    this._logger.warn(fullMessage)
}

function debug(...messages: any[]) {
    let fullMessage = ''

    for (const message of messages) {
        fullMessage += message
    }
    this._logger.debug(fullMessage)
}

function trackRequest(obj: any) {
    if (client) {
        try {
            client.trackRequest(obj)
        } catch (error) {
            console.error('trackRequest failed with error ' + error)
            error(error)
        }
    }
}

function error(...messages: any[]) {
    let fullMessage = ''

    for (const message of messages) {
        fullMessage += message
    }

    const category = this._logger.category
    if (client) {
        client.trackException({ exception: new Error(`[ERROR] ${category} - ${fullMessage}`) })
    }
    this._logger.error(fullMessage)

    if (getConfigProp(LOGGING) === 'debug' || getConfigProp(LOGGING) === 'error') {
        errorStack.push([category, fullMessage])
    }
}
