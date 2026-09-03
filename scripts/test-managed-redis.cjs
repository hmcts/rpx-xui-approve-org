'use strict';

const { randomUUID } = require('node:crypto');
const { createClient } = require('redis');

const connectionString = process.env.REDISCLOUD_URL;
const testKey = `activity:managed-redis-smoke:${randomUUID()}`;
const testValue = randomUUID();

function validateManagedRedisUrl(value) {
  if (!value) {
    throw new Error('REDISCLOUD_URL is not set');
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('REDISCLOUD_URL is not a valid URL');
  }

  if (url.protocol !== 'rediss:') {
    throw new Error('REDISCLOUD_URL must use rediss:// so the connection uses TLS');
  }

  if (!url.hostname.endsWith('.redis.azure.net')) {
    throw new Error('REDISCLOUD_URL is not an Azure Managed Redis endpoint');
  }

  if (url.port !== '10000') {
    throw new Error('Azure Managed Redis must use port 10000');
  }

  if (!url.password) {
    throw new Error('REDISCLOUD_URL does not contain an access key');
  }

  return url;
}

function safeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!connectionString) {
    return message;
  }

  let redactedMessage = message
    .replaceAll(connectionString, '[REDACTED_REDIS_URL]')
    .replace(/rediss?:\/\/[^@\s]+@/gi, 'rediss://[REDACTED]@');

  try {
    const password = new URL(connectionString).password;
    if (password) {
      redactedMessage = redactedMessage
        .replaceAll(password, '[REDACTED_REDIS_KEY]')
        .replaceAll(decodeURIComponent(password), '[REDACTED_REDIS_KEY]');
    }
  } catch {
    // URL validation reports the safe error; there is nothing else to redact.
  }

  return redactedMessage;
}

async function run() {
  const url = validateManagedRedisUrl(connectionString);
  let lastClientError;
  const client = createClient({
    url: connectionString,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: false
    }
  });

  client.on('error', (error) => {
    lastClientError = error;
  });

  try {
    await client.connect();

    const pingResponse = await client.ping();
    if (pingResponse !== 'PONG') {
      throw new Error(`Unexpected PING response: ${pingResponse}`);
    }

    await client.set(testKey, testValue, { EX: 60 });
    const storedValue = await client.get(testKey);
    if (storedValue !== testValue) {
      throw new Error('Redis SET/GET verification failed');
    }

    await client.del(testKey);
    console.log(`Azure Managed Redis connectivity passed for ${url.hostname}:${url.port}`);
    console.log('TLS URL validation, authentication, PING, SET, GET and DEL passed.');
  } catch (error) {
    throw lastClientError || error;
  } finally {
    if (client.isReady) {
      await client.quit();
    } else if (client.isOpen) {
      client.destroy();
    }
  }
}

run().catch((error) => {
  console.error(`Azure Managed Redis connectivity failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
});
