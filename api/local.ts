import * as auth from './auth'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as session from 'express-session'
import * as globalTunnel from 'global-tunnel-ng'
import * as log4js from 'log4js'
import * as sessionFileStore from 'session-file-store'
import { appInsights } from './lib/appInsights'
import { config } from './lib/config'
import { errorStack } from './lib/errorStack'
import openRoutes from './openRoutes'
import routes from './routes'

const FileStore = sessionFileStore(session)

const app = express()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

app.use(
    session({
        cookie: {
            httpOnly: true,
            maxAge: 1800000,
            secure: config.secureCookie !== false,
        },
        name: 'jui-webapp',
        resave: true,
        saveUninitialized: true,
        secret: config.sessionSecret,
        store: new FileStore({
            path: process.env.NOW ? '/tmp/sessions' : '.sessions',
        }),
    })
)

if (config.proxy) {
    globalTunnel.initialize({
        host: config.proxy.host,
        port: config.proxy.port,
    })
}

app.use(errorStack)
app.use(appInsights)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

/**
 * Open Routes
 *
 * Any routes here do not have authentication attached and are therefore reachable.
 */
app.get('/oauth2/callback', auth.oauth)
app.get('/external/ping', (req, res) => {
  console.log('Pong')
  res.send('Pong')
})
app.use('/external', openRoutes)

// Should not be required remove when ready.
app.use(auth.attach)

/**
 * Secure Routes
 *
 * Used both local.ts and server.ts
 */
app.use('/api', routes)
app.get('/api/logout', (req, res, next) => {
  auth.doLogout(req, res)
})

/**
 * It looks like Angular is proxy'ing all requests to port 3001,
 * hence the default port number here is 3001.
 *
 * TODO: Firstly let's try and replicate what we have here using
 * createServer method.
 *
 * @type {(string | undefined) & number}
 */
const port = process.env.PORT || 3001
// app.listen(port)

/**
 * We can serve http content over any port. Hence I've left this as 3001.
 */
const httpPort = 3001
const httpsPort = 443

/**
 * Get Ssl Credentials
 *
 * <code>key:</code>
 * The key is the private key that will be used to decode the incoming data, that would of been encrypted with
 * the public key.
 *
 * <code>cert:</code>
 * The cert is the cert given by the SSL certificate authority or it could be a self signed cert.
 *
 * <code>ca:</code>
 * This is necessary only if the client uses a self-signed certificate.
 *
 * <code>requestCert:true</code>
 * This is necessary only if using client certificate authentication.
 *
 * The TLS/SSL is a public/private key infrastructure (PKI). For most common cases, each client and server must have a private key.
 *
 * Steps to Generate Self Certs
 * ----------------------------
 *
 * 1. Use `openssl genrsa -out phils-key.pem 2048` to generate a Private key
 *
 * With TLS/SSL, all servers (and some clients) must have a certificate. Certificates are public keys that correspond to a private key,
 * and that are digitally signed either by a Certificate Authority or by the owner of the private key (such certificates are referred to as "self-signed"). The first step to obtaining a certificate is to create a Certificate Signing Request (CSR) file.
 *
 * The OpenSSL command-line interface can be used to generate a CSR for a private key:
 *
 * `openssl req -new -sha256 -key phils-key.pem -out phils-csr.pem`
 *
 * Once the CSR file is generated, it can either be sent to a Certificate Authority for signing or used to generate a self-signed certificate.
 *
 * Creating a self-signed certificate using the OpenSSL command-line interface is illustrated in the example below:
 * `openssl x509 -req -in ryans-csr.pem -signkey phils-key.pem -out phils-cert.pem`
 *
 * Ref: https://nodejs.org/api/tls.html
 *
 * @ref https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
 * @ref https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
 * @ref https://nodejs.org/api/tls.html#tls_tls_createserver_options_secureconnectionlistener
 *
 * TODO: Is it worth having these come from a vault of some kind?
 * TODO: Abstract
 */
const getSslCredentials = () => {
  return {
    key: fs.readFileSync('./phils-key.pem'),
    cert: fs.readFileSync('./phils-cert.pem'),
  }
}

// Working on SSL
const httpServer = http.createServer(app)
// This is using https and not http

const httpsServer = https.createServer(getSslCredentials(), app)

/**
 * Non-secure http content
 */
httpServer.listen(httpPort, () => {
 console.log(`Http Server started on port ${httpPort}`)
})

/**
 * Secure https content should be served over SSL, hence port 443.
 */
httpsServer.listen(httpsPort, () => {
  console.log(`Https Server started on port ${httpsPort}`)
})

if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    config.appInsightsInstrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY
}

const logger = log4js.getLogger('server')
logger.level = config.logging ? config.logging : 'OFF'

// logger.info(`Local server up at ${port}`)
