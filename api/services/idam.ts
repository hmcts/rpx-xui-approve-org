import { AxiosResponse } from 'axios'
import { environmentConfig } from '../lib/environment.config'
import { http } from '../lib/http'

export async function getUserDetails(jwt: string): Promise<AxiosResponse> {
    const options = {
        headers: { Authorization: `Bearer ${jwt}` },
    }

    return await http.get(`${environmentConfig.services.idamApi}/details`, options)
}
