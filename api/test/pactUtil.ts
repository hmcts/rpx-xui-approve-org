import { InteractionObject, Pact } from '@pact-foundation/pact';
import axios, { AxiosResponse } from 'axios';
import * as getPort from 'get-port';
import * as path from 'path';

let mockServerPort: number;
let provider: Pact;

export async function providerSetUp(providerName:string) {
  mockServerPort = await getPort()

  provider = new Pact({
    port: mockServerPort,
    log: path.resolve(process.cwd(), "api/test/pact/logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "api/test/pact/pacts"),
    spec: 2,
    consumer: "xui_approveorg",
    provider: providerName,
    pactfileWriteMode: "merge",
  })
  before(() => provider.setup())

//  return  provider;
}


export async function providerFinalize() {
  after(() => provider.finalize())
  // verify with Pact, and reset expectations
  afterEach(() => provider.verify())
//  return  provider;
}

export async  function addInteraction(interaction:InteractionObject){

  // @ts-ignore
  provider.addInteraction(interaction).then(() => {

  })
}



export async function getOperation(taskUrl: string) {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  }

  let response: AxiosResponse
  response = await axios.get(taskUrl, axiosConfig)
  return response

}

export async function deleteOperation(taskUrl: string) {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  }


  let response: AxiosResponse
  response = await axios.delete(taskUrl, axiosConfig)
  return response

}

export async function putOperation(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken",
      "Authorization": "Bearer some-access-token"
    }
  }
  let response: AxiosResponse
  response = await axios.put(taskUrl, payload as object, axiosConfig)
  return response
}

export async function postOperation(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Authorization": "Bearer some-access-token",
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken"
    }
  }

  let response: AxiosResponse

  response = await axios.post(taskUrl, payload as object, axiosConfig)
  return response
}

export async function postLease(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json"
    }
  }
  let response: AxiosResponse
  response = await axios.post(taskUrl, payload , axiosConfig)
  return response
}

export async function idamGetUserDetails(taskUrl:string){

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
    }
  }

  let response: AxiosResponse
  response = await axios.get(taskUrl, axiosConfig)
  return response
}
