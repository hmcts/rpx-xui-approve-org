import * as exceptionFormatter from 'exception-formatter'
import * as stringify from 'json-stringify-safe'
import * as errorStack from '../lib/errorStack'
// import {environmentConfig} from './environment.config'
import * as log4jui from './log4jui'
import {exists, getTrackRequestObj, shorten, valueOrNull} from './util'

const exceptionOptions = {
  maxLines: 1,
}

export function requestInterceptor(request) {
  const logger = log4jui.getLogger('outgoing')

  const url = shorten(request.url, environmentConfig.maxLogLine)
  logger.info(`${request.method.toUpperCase()} to ${url}`)
  //add timings to requests
  request.metadata = {startTime: new Date()}

  return request
}

export function successInterceptor(response) {
  response.config.metadata.endTime = new Date()
  response.duration = response.config.metadata.endTime - response.config.metadata.startTime

  const logger = log4jui.getLogger('return')

  const url = shorten(response.config.url, environmentConfig.maxLogLine)

  logger.trackRequest({
    duration: response.duration,
    name: `Service ${response.config.method.toUpperCase()} call`,
    resultCode: response.status,
    success: true,
    url: response.config.url,
  })

  logger.info(`Success on ${response.config.method.toUpperCase()} to ${url} (${response.duration})`)
  return response
}

export function errorInterceptor(error) {
  const errorConfig = error.config
  if (errorConfig && errorConfig.metadata) {
    errorConfig.metadata.endTime = new Date()
    error.duration = errorConfig.metadata.endTime - errorConfig.metadata.startTime
  }

  const logger = log4jui.getLogger('return')

  let url = ''
  if (errorConfig.url) {
    url = shorten(errorConfig.url, environmentConfig.maxLogLine)
  }

  // application insights logging
  logger.trackRequest(getTrackRequestObj(error))

  if (errorConfig.method && error.response) {
    let data = valueOrNull(error, 'response.data.details')
    if (!data) {
      data = valueOrNull(error, 'response.status') ? JSON.stringify(error.response.data, null, 2) : null
      logger.error(`Error on ${errorConfig.method.toUpperCase()} to ${url} in (${error.duration}) - ${error} \n
            ${exceptionFormatter(data, exceptionOptions)}`)
    } else {
      logger.error(`Error on ${errorConfig.method.toUpperCase()} to ${url} in (${error.duration}) - ${error} \n
            ${JSON.stringify(data)}`)
    }
  }

  if (!exists(error, 'request')) {
    error.request = {url}
  }

  if (!exists(error, 'response')) {
    error.response = {url, 'message': 'No api response'}
  }

  errorStack.push(['request', JSON.parse(stringify(error.request))])
  errorStack.push(['response', JSON.parse(stringify(error.response))])
  return Promise.reject(error.response)
}
