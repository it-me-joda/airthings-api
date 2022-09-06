import axios, { AxiosResponse } from 'axios'
import { AccessToken, ClientCredentials, ModuleOptions } from 'simple-oauth2'

export interface AirThingsConfiguration {
    id: string;
    secret: string;
}

export class AirThingsApi {
    config: ModuleOptions<'client_id'>
    accessToken: AccessToken | null

    constructor(configuration: AirThingsConfiguration) {
        this.config = {
            client: {
                id: configuration.id,
                secret: configuration.secret,
            },
            auth: {
                tokenHost: 'https://accounts.airthings.com',
                tokenPath: 'https:/=accounts-api.airthings.com/v1/token',
                authorizePath: '/authorize',
            },
            options: {
                authorizationMethod: 'body',
            }
        }

        this.accessToken = null
    }

    public async getDeviceList() {
        if (!this.accessToken || this.accessToken.expired()) {
            await this.updateToken()
        }

        return await axios.get('https://api.airthings.com/v1/devices', {
            headers: {
                Authorization: `Bearer ${this.accessToken!.token.access_token}`
            },
        }).then((value: AxiosResponse) => {
            return value.data.devices
        }).catch((reason: any) => {
            console.error(reason)
            throw new Error(`airthings-api error: ${reason}`)
        })
    }

    public async getDevice(deviceId: string) {
        if (!this.accessToken || this.accessToken.expired()) {
            await this.updateToken()
        }

        return await axios.get(`https://api.airthings.com/v1/devices/${deviceId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken!.token.access_token}`
            },
        }).then((value: AxiosResponse) => {
            return value.data
        }).catch((reason: any) => {
            console.error(reason)
            throw new Error(`airthings-api error: ${reason}`)
        })
    
    }

    public async getDeviceSamples(deviceId: string) {
        if (!this.accessToken || this.accessToken.expired()) {
            await this.updateToken()
        }

        return await axios.get(`https://ext-api.airthings.com/v1/devices/${deviceId}/latest-samples`, {
            headers: {
                Authorization: `Bearer ${this.accessToken!.token.access_token}`,
            },
        }).then((value: any) => {
            return value.data.data
        }).catch((reason: any) => {
            console.error(reason)
            throw new Error(`airthings-api error: ${reason}`)
        })
    }

    async updateToken() {
        const client = new ClientCredentials(this.config)
        this.accessToken = await client.getToken({scope: 'read:device:current_value'}).catch((reason: any) => {
            console.error(reason)
            throw new Error(`airthings-api Token error: ${reason}`)
        })
    }
}
