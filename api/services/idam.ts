import { AxiosResponse } from 'axios'
import * as express from 'express'
import { http } from '../lib/http'

export async function getUserDetails(jwt: string, url: string): Promise<AxiosResponse> {
    const options = {
        headers: { Authorization: `Bearer ${jwt}` },
    }
    const axiosInstance = http(({
      session: {
        auth: {
          token: jwt
        }
      }
    } as unknown) as express.Request) 
  
    return await axiosInstance.get(`${url}/details`, options)
}
