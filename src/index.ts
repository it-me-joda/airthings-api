import axios, { AxiosError, AxiosResponse } from 'axios'
import { AccessToken, ClientCredentials, ModuleOptions } from 'simple-oauth2'

export interface AirThingsConfiguration {
	id: string
	secret: string
}

export interface Device {
	id: string
	deviceType: string
	sensors: string[]
	segment: {
		id: string
		name: string
		started: string
		active: boolean
	}
	location: {
		id: string
		name: string
	}
}

export interface Readings {
	battery: number
	co2: number
	humidity: number
	light: number
	lux: number
	mold: number
	pm1: number
	pm10: number
	pm25: number
	pressure: number
	pressureDifference: number
	radonShortTermAvg: number
	rssi: number
	sla: number
	temp: number
	time: number
	virusRisk: number
	voc: number
	outdoorTemp: number
	outdoorHumidity: number
	outdoorPressure: number
	outdoorPm1: number
	outdoorPm10: number
	outdoorPm25: number
	outdoorNo2: number
	outdoorO3: number
	outdoorSo2: number
	outdoorCo: number
	outdoorNo: number
	controlSignal: number
	controlSignal01: number
	controlSignal02: number
	controlSignal03: number
	controlSignal04: number
	controlSignal05: number
	controlSignal06: number
	controlSignal07: number
	controlSignal08: number
	regulationPressure: number
	regulationHeigh: number
	relayDeviceType: string
}

/**
 * AirThings API client for Node.js
 */
export class AirThingsApi {
	private config: ModuleOptions
	private accessToken: AccessToken | null

	constructor(configuration: AirThingsConfiguration) {
		this.config = {
			client: {
				id: configuration.id,
				secret: configuration.secret,
			},
			auth: {
				tokenHost: 'https://accounts.airthings.com',
				tokenPath: 'https:/accounts-api.airthings.com/v1/token',
				authorizePath: '/authorize',
			},
			options: {
				authorizationMethod: 'body',
			},
		}

		this.accessToken = null
	}

	/**
	 * Gets all devices for the authenticated user
	 * @returns {Device[]}
	 */
	public async getDeviceList(): Promise<Device[]> {
		if (!this.accessToken || this.accessToken.expired()) {
			await this.updateToken()
		}

		return await axios
			.get('https://ext-api.airthings.com/v1/devices', {
				headers: {
					Authorization: `Bearer ${
						this.accessToken?.token['access_token'] as string
					}`,
				},
			})
			.then((value: AxiosResponse<{ devices: Device[] }>) => {
				return value.data.devices
			})
			.catch((error: Error | AxiosError) => {
				throw this.getError(error)
			})
	}

	/**
	 * Gets a device by its id/serial number
	 * @param {string} deviceId
	 * @returns {Device}
	 */
	public async getDevice(deviceId: string): Promise<Device> {
		if (!this.accessToken || this.accessToken.expired()) {
			await this.updateToken()
		}

		return await axios
			.get(`https://ext-api.airthings.com/v1/devices/${deviceId}`, {
				headers: {
					Authorization: `Bearer ${
						this.accessToken?.token['access_token'] as string
					}`,
				},
			})
			.then((value: AxiosResponse) => {
				return value.data as Device
			})
			.catch((error: Error | AxiosError) => {
				throw this.getError(error)
			})
	}

	/**
	 * Gets the latest readings for a device
	 * @param {string} deviceId
	 * @returns {Readings}
	 */
	public async getDeviceSamples(deviceId: string): Promise<Readings> {
		if (!this.accessToken || this.accessToken.expired()) {
			await this.updateToken()
		}

		return await axios
			.get(
				`https://ext-api.airthings.com/v1/devices/${deviceId}/latest-samples`,
				{
					headers: {
						Authorization: `Bearer ${
							this.accessToken?.token['access_token'] as string
						}`,
					},
				},
			)
			.then((value: AxiosResponse<{ data: Readings }>) => {
				return value.data.data
			})
			.catch((error: Error | AxiosError) => {
				throw this.getError(error)
			})
	}

	/**
	 * Gets the access token from the API
	 */
	private async updateToken(): Promise<void> {
		const client = new ClientCredentials(this.config)
		this.accessToken = await client
			.getToken({ scope: 'read:device:current_value' })
			.then((value: AccessToken) => {
				return value
			})
			.catch((error: Error | AxiosError) => {
				throw this.getError(error)
			})
	}

	private getError(error: Error | AxiosError): Error {
		if (axios.isAxiosError(error)) {
			const e = error.toJSON()
			console.error(e)
			return new Error(`airthings-api error: ${JSON.stringify(e)}`)
		} else {
			console.error(error)
			return new Error(`airthings-api error: ${error.message}`)
		}
	}
}
