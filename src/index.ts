import axios, { AxiosError, AxiosResponse } from 'axios'

export interface AirThingsConfiguration {
	id: string
	secret: string
}

export interface AccessToken {
	token: string
	type: string
	expiresAt: number
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
	private config: AirThingsConfiguration
	private accessToken: AccessToken | null

	constructor(configuration: AirThingsConfiguration) {
		this.config = configuration
		this.accessToken = null
	}

	/**
	 * Gets all devices for the authenticated user
	 * @returns {Device[]}
	 */
	public async getDeviceList(): Promise<Device[]> {
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await axios
			.get('https://ext-api.airthings.com/v1/devices', {
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
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
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await axios
			.get(`https://ext-api.airthings.com/v1/devices/${deviceId}`, {
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`
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
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await axios
			.get(
				`https://ext-api.airthings.com/v1/devices/${deviceId}/latest-samples`,
				{
					headers: {
						Authorization: `Bearer ${this.accessToken.token}`,
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
	 * Checks if the access token is expired (or nearly expired)
	 * @returns {boolean}
	 */
	private isTokenExpired(): boolean {
		if (!this.accessToken) return true

		return this.accessToken.expiresAt - 15 < Date.now()
	}

	/**
	 * Gets the access token from the API
	 */
	private async updateToken(): Promise<void> {
		const body = JSON.stringify({
			grant_type: 'client_credentials',
		})

		this.accessToken = await axios.post('https://accounts-api.airthings.com/v1/token', body, {
			headers: {
				'Authorization': `Basic ${Buffer.from(`${this.config.id}:${this.config.secret}`).toString('base64')}`,
				'content-type': 'application/json',
			},
		},
		).then((value: AxiosResponse<{
			access_token: string,
			token_type: string,
			expires_in: number,
		}>) => {
			console.log(value.data)
			const token: AccessToken = {
				token: value.data.access_token,
				type: value.data.token_type,
				expiresAt: value.data.expires_in + Date.now(),
			}
			return token
		}).catch((error: Error | AxiosError) => {
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
