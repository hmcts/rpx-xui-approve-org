import axios, {AxiosResponse} from 'axios'

export async function getActiveUsersForOrganisaiton(taskUrl: string) {

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
  return response

}
