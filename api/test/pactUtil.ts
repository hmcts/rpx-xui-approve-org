import axios, {AxiosResponse} from 'axios'
import {UpdateOrganisationRequest} from './pactFixtures';

export async function getOrganisationDeleteStatusRoute(taskUrl: string) {

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

export async function getAccountDetailsByName(taskUrl: string) {

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

export async function deleteOrganisation(taskUrl: string) {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  }

  console.log( `.....+++++++++ the url is ` + taskUrl);

  let response: AxiosResponse
  response = await axios.delete(taskUrl, axiosConfig)

  console.log(`~~~~~~~~~~~~~~~ Response Obtained...~~~~~~~~~~~~~`,response);
  return response

}

export async function updateOrganisation(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken",
      "Authorization": "Bearer some-access-token"
    }
  }

  console.log( `.....+++++++++ Inside the updateOrganisation Payload is .... ` + JSON.stringify(payload));

  let response: AxiosResponse

  response = await axios.put(taskUrl, payload as object, axiosConfig)
  console.log(`~~~~~~~~~~~~~~~ Response Obtained...~~~~~~~~~~~~~`,response);
  return response
}

export async function updatePbaForOrganisation(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken",
      "Authorization": "Bearer some-access-token"
    }
  }

  console.log( `.....+++++++++ Inside the updateOrganisation Payload is .... ` + JSON.stringify(payload));

  let response: AxiosResponse

  response = await axios.put(taskUrl, payload as object, axiosConfig)
  console.log(`~~~~~~~~~~~~~~~ Response Obtained...~~~~~~~~~~~~~`,response);
  return response
}

export async function reinviteUser(taskUrl: string, payload:any){

  const axiosConfig = {
    headers: {
      "Authorization": "Bearer some-access-token",
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken"
    }
  }

  let response: AxiosResponse

  response = await axios.post(taskUrl, payload as object, axiosConfig)
  console.log(`~~~~~~~~~~~~~~~ Response Obtained...~~~~~~~~~~~~~`,response);
  return response
}

