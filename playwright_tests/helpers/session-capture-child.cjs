/* global module, require, process, console, AbortController */
/* eslint-disable @typescript-eslint/no-require-imports */
function safeError(error) {
  const message = error instanceof Error ? error.message : '';
  if (/^Authentication probe unavailable: HTTP [1-5][0-9]{2}\.$/.test(message)) {
    return message;
  }
  if (/^Authentication probe unavailable: (request timeout|transport failure|expected a boolean response)\.$/.test(message)) {
    return message;
  }
  const closeFailure = 'Browser close failed; session capture lock retained.';
  const safeCauses = [
    'Session capture lock ownership was lost.',
    'Session capture authentication was rejected.',
    'A network error interrupted session capture.',
    'Session capture timed out.',
    'Unable to authenticate during session capture.',
    'Missing Playwright session credentials.',
    'A recent session capture failed; waiting before retrying.'
  ];
  if (safeCauses.some((cause) => message === `${cause} ${closeFailure}`) ||
      /^Authentication probe unavailable: (?:HTTP [1-5][0-9]{2}|request timeout|transport failure|expected a boolean response)\. Browser close failed; session capture lock retained\.$/.test(message)) {
    return message;
  }
  if (message === 'Browser close failed; session capture lock retained.') {
    return message;
  }
  if (/^Recent session capture failed for /.test(message)) {
    return 'A recent session capture failed; waiting before retrying.';
  }
  if (/\b(?:net::ERR_[A-Z_]+|ECONNRESET|ECONNREFUSED|ETIMEDOUT)\b/i.test(message)) {
    return 'A network error interrupted session capture.';
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    return 'Session capture timed out.';
  }
  if (/Session capture lock ownership was lost/.test(message)) {
    return 'Session capture lock ownership was lost.';
  }
  if (/Timed out waiting for Playwright session capture lock/.test(message)) {
    return 'Timed out waiting for session capture lock; check for an orphan lock.';
  }
  if (/Session capture did not create an authenticated session/.test(message)) {
    return 'Session capture authentication was rejected.';
  }
  if (/Unable to authenticate/.test(message)) {
    return 'Unable to authenticate during session capture.';
  }
  if (/Missing Playwright credentials/.test(message)) {
    return 'Missing Playwright session credentials.';
  }
  return 'Session capture failed; details unavailable.';
}

function safeLog(args) {
  const message = args.map(String).join(' ');
  if (message.includes('Reusing session')) {
    return 'Reusing session.';
  }
  if (message.includes('Fresh session appeared')) {
    return 'Fresh session appeared while waiting for the lock.';
  }
  if (message.includes('Capturing session')) {
    return 'Capturing session.';
  }
  if (message.includes('Transient capture failure')) {
    return 'Transient session capture failure; retrying.';
  }
  return undefined;
}

module.exports = { safeError, safeLog };
if (require.main === module) {
  require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS' } });
  const { config } = require('../config/config.ts');
  const { sessionCaptureInProcess } = require('./sessionCapture.ts');
  const sendLog = (warning, args) => {
    const log = safeLog(args);
    if (process.connected && log) {
      process.send({ log, warning });
    }
  };
  console.log = (...args) => sendLog(false, args);
  console.warn = (...args) => sendLog(true, args);
  const controller = new AbortController();
  let finished = false;
  process.on('disconnect', () => {
    if (!finished) {
      controller.abort();
    }
  });
  process.once('message', async ({ identity, options, baseUrl, idamWebUrl }) => {
    config.baseUrl = baseUrl;
    config.idamWebUrl = idamWebUrl;
    try {
      const path = await sessionCaptureInProcess(identity, options, controller.signal);
      finished = true;
      if (process.connected) {
        process.send({ path });
      }
    } catch (error) {
      finished = true;
      if (process.connected) {
        process.send({ error: safeError(error) });
      }
    } finally {
      if (process.connected) {
        process.disconnect();
      }
    }
  });
}
