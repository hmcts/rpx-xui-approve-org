import axios, { AxiosResponse } from 'axios';

export async function getOperation(taskUrl: string): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };

  let response: AxiosResponse;
  response = await axios.get(taskUrl, axiosConfig);
  return response;

}

export async function deleteOperation(taskUrl: string): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };

  let response: AxiosResponse;
  response = await axios.delete(taskUrl, axiosConfig);
  return response;

}

export async function putOperation(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      "Authorization": "Bearer some-access-token",
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken"
    }
  };
  let response: AxiosResponse;
  response = await axios.put(taskUrl, payload as object, axiosConfig);
  return response;
}

export async function postOperation(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      "Authorization": "Bearer some-access-token",
      "Content-Type": "application/json",
      "ServiceAuthorization": "ServiceAuthToken"
    }
  };

  let response: AxiosResponse;

  response = await axios.post(taskUrl, payload as object, axiosConfig);
  return response;
}

export async function postLease(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  let response: AxiosResponse;
  response = await axios.post(taskUrl, payload , axiosConfig);
  return response;
}

export async function idamGetUserDetails(taskUrl: string): Promise<AxiosResponse<any>> {

  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
    }
  };

  let response: AxiosResponse;
  response = await axios.get(taskUrl, axiosConfig);
  return response;
}
