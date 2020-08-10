import { s2s } from '@hmcts/rpx-xui-node-lib';
import {getConfigValue} from '../../../../api/configuration';
import {MICROSERVICE, S2S_SECRET, SERVICE_S2S_PATH} from '../../../../api/configuration/references';
import { getauthToken } from './getToken';
const fetch = require('node-fetch');


// const mainURL = process.env.TEST_URL || 'https://localhost:3000';
const mainURL = 'http://rd-professional-api-aat.service.core-compute-aat.internal'
const LOG_REQUEST_ERROR_DETAILS = false;
const s2sSecret = getConfigValue(S2S_SECRET).trim();
const microservice = getConfigValue(MICROSERVICE);
const s2sEndpointUrl = `${getConfigValue(SERVICE_S2S_PATH)}/lease`;

export async function generatePOSTAPIRequest(method, subURL, payload) {

  let s2sToken;
  let authToken;

  try {

    s2s.configure({
      microservice,
      s2sEndpointUrl,
      s2sSecret
    });

    s2sToken = await s2s.serviceTokenGenerator();
    authToken = await getauthToken();

    const options = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        ServiceAuthorization: s2sToken,
        'Content-Type': 'application/json'
      },
      // json: true,
     //  resolveWithFullResponse: true,
      method,
      body: JSON.stringify(payload)
    };

    const url = `${mainURL}${subURL}`;

    console.log('url: ', url);
    console.log('method: ', method);
    console.log('options: ', options);

    // if (params.body) {
    //   options.body = params.body;
    // }

   // console.log('OPTIONS: ', method, mainURL + subURL, options);
    const response = await fetch(url, options);
    const data = await response.json();
    const headers = response.headers;
    return {
      headers,
      status: response.status,
      statusText: response.statusText,
      data
    };

  } catch (error) {
    console.log(error);
  }

 }

