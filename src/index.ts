import {
	AccessToken,
	AirThingsConfiguration,
	Device,
	Readings,
} from './interfaces/'

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

		return await fetch('https://ext-api.airthings.com/v1/devices', {
			headers: {
				Authorization: `Bearer ${this.accessToken.token}`,
			},
		})
			.then(async (response) => {
				return await response.json().then((value) => {
					return value.devices as Device[]
				})
			})
			.catch((error) => {
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

		return await fetch(
			`https://ext-api.airthings.com/v1/devices/${deviceId}`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
				},
			},
		)
			.then(async (response) => {
				return (await response.json()) as Device
			})
			.catch((error) => {
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

		return await fetch(
			`https://ext-api.airthings.com/v1/devices/${deviceId}/latest-samples`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
				},
			},
		)
			.then(async (res: Response) => {
				return JSON.parse(await res.text()) as Readings
			})
			.catch((error: any) => {
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

		const authorization = Buffer.from(
			`${this.config.id}:${this.config.secret}`,
		).toString('base64')
		this.accessToken = await fetch(
			`https://accounts-api.airthings.com/v1/token`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Basic ${authorization}`,
					'content-type': 'application/json',
				},
				body: body,
			},
		)
			.then(async (res: Response) => {
				const data = JSON.parse(await res.text())
				const token: AccessToken = {
					token: data.access_token,
					type: data.token_type,
					expiresAt: data.expires_in + Date.now(),
				}
				return token
			})
			.catch((error: any) => {
				throw this.getError(error)
			})
	}

	private getError(error: Error): Error {
		console.log(error)
		return new Error(`airthings-api error: ${error.message}`)
	}
}
