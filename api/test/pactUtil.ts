import axios, { AxiosResponse } from 'axios';

export async function getOperation(taskUrl: string): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };

  return await axios.get(taskUrl, axiosConfig);
}

export async function deleteOperation(taskUrl: string): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };

  return await axios.delete(taskUrl, axiosConfig);
}

export async function putOperation(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };
  return await axios.put(taskUrl, payload as object, axiosConfig);
}

export async function postOperation(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };

  return await axios.post(taskUrl, payload as object, axiosConfig);
}

export async function postLease(taskUrl: string, payload: any): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return await axios.post(taskUrl, payload, axiosConfig);
}

export async function idamGetUserDetails(taskUrl: string): Promise<AxiosResponse<any>> {
  const axiosConfig = {
    headers: {
      'Authorization': 'Bearer some-access-token',
      'Content-Type': 'application/json'
    }
  };

  return await axios.get(taskUrl, axiosConfig);
}

export async function postS2SLease(S2SUrl: string, payload: any): Promise<any> {
  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'ServiceAuthorization': 'ServiceAuthToken'
    }
  };
  return await axios.post(S2SUrl, payload, axiosConfig);
}
