import axios, { AxiosInstance } from 'axios'
import { Request } from 'express'
import { errorInterceptor, requestInterceptor, successInterceptor } from './interceptors'
import {exists} from './util'

axios.defaults.headers.common['Content-Type'] = 'application/json'

export const http = (req: Request) => {

  const axiosInstance: AxiosInstance = axios.create({
    headers: req.headers
  })
  axiosInstance.interceptors.request.use(requestInterceptor)
  axiosInstance.interceptors.response.use(successInterceptor, errorInterceptor)

  return axiosInstance
}
