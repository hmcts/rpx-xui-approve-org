import axios, {AxiosResponse} from 'axios'

export async function getAccountDetailsByAccountNumber(taskUrl: string) {

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
  let response: AxiosResponse
  response = await axios.put(taskUrl, payload as object, axiosConfig)
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
  let response: AxiosResponse
  response = await axios.put(taskUrl, payload as object, axiosConfig)
  return response
}

export async function postReinviteUser(taskUrl: string, payload:any){

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

export async function getOrganisationDetailsByOrgIdAndReturnRoles(taskUrl: string) {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  }
  return await axios.get(taskUrl, axiosConfig)
}


