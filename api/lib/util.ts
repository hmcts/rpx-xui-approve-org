import { Response } from 'express';
import { EnhancedRequest } from '../models/enhanced-request.interface';

export function asyncReturnOrError(
  promise: any,
  message: string,
  res: Response | null,
  logger,
  setResponse: boolean = true
): any {
  return promise
    .then((data) => {
      return data;
    })
    .catch((err) => {
      const msg = `${message}`;
      logger.error(msg);

      if (setResponse) {
        res.status(err.statusCode || 500).send(msg);
      }

      return null;
    });
}

export function some(array, predicate) {
  for (const item in array) {
    if (array[item]) {
      const result = predicate(array[item]);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

export function dotNotation(nestled: string) {
  // eslint-disable-next-line no-useless-escape
  return nestled.replace(/[\[\]]/g, '.');
}

export function valueOrNull(object: any, nestled: string) {
  const value = exists(object, nestled, true);
  return value ? value : null;
}

export function exists(object: any, nestled: string, returnValue = false) {
  const dotArray = dotNotation(nestled).split('.');
  if (object) {
    if (dotArray.length && dotArray[0] !== '') {
      const current = dotArray[0];
      dotArray.shift();
      if (object[current]) {
        return exists(object[current], dotArray.join('.'), returnValue);
      }
      return false;
    }
    return returnValue ? object : true;
  }
  return false;
}

export function shorten(str: string, maxLen: number): string {
  return str.length > maxLen ? `${str.substring(0, maxLen)}...` : str;
}

export function isObject(o) {
  return o !== null && typeof o === 'object' && Array.isArray(o) === false;
}

export async function getHealth(url: string, req: EnhancedRequest) {
  const response = await req.http.get(`${url}/health`);

  return response.data;
}

export async function getInfo(url: string, req: EnhancedRequest) {
  const response = await req.http.get(`${url}/info`);

  return response.data;
}

export function getTrackRequestObj(error: any) {
  return {
    duration: error ? error.duration : '',
    name: error.config && error.config.method ? `Service ${error.config.method.toUpperCase()} call` : 'Service call',
    resultCode: error.status,
    success: true,
    url: error.config && error.config.url ? error.config.url : ''
  };
}
