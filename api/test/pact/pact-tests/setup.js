import * as getPort from "get-port";

const path = require('path');
const Pact = require('@pact-foundation/pact').Pact;

let MOCK_SERVER_PORT
let idamTestUrl
let provider
MOCK_SERVER_PORT = await getPort()
idamTestUrl = `http://localhost:${MOCK_SERVER_PORT}`

global.port = 8080;
global.provider = new Pact({
  cors: true,
  port: global.port,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  loglevel: 'debug',
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  pactfileWriteMode: 'update',
  consumer: 'hero-consumer',
  provider: 'hero-provider',
  host: '127.0.0.1'
});
