import {
	AccessToken,
	AirThingsConfiguration,
	Device,
	Samples,
	Location,
	LocationInfo,
	LocationSamples,
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
	 * @param {any} [queryParams] - Optional query parameters. Default values: showInactive = false, limit = 10, offset = 0
	 * @returns {Device[]}
	 */
	public async getDeviceList(
		queryParams: {
			showInactive?: boolean
			limit?: number
			offset?: number
		} = { showInactive: false, limit: 10, offset: 0 },
	): Promise<Device[]> {
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await fetch(
			`https://ext-api.airthings.com/v1/devices?showInactive=${queryParams.showInactive}&limit=${queryParams.limit}&offset=${queryParams.offset}`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
				},
			},
		)
			.then(async (res) => {
				return await res.json().then((value: { devices: Device[] }) => {
					return value.devices
				})
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
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
			.then(async (res) => {
				return (await res.json()) as Device
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
			})
	}

	/**
	 * Gets the latest samples for a device
	 * @param {string} deviceId
	 * @returns {Samples}
	 */
	public async getDeviceSamples(deviceId: string): Promise<Samples> {
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
			.then(async (res) => {
				return JSON.parse(await res.text()) as Samples
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
			})
	}

	/**
	 * Gets the full list of locations
	 * @returns {Location[]}
	 */
	public async getLocations(): Promise<Location[]> {
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await fetch('https://ext-api.airthings.com/v1/locations', {
			headers: {
				Authorization: `Bearer ${this.accessToken.token}`,
			},
		})
			.then(async (res) => {
				return res.json().then((value: { locations: Location[] }) => {
					return value.locations
				})
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
			})
	}

	/**
	 * Gets the location by it's id
	 * @returns LocationInfo
	 */
	public async getLocation(locationId: string): Promise<LocationInfo> {
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await fetch(
			`https://ext-api.airthings.com/v1/locations/${locationId}`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
				},
			},
		)
			.then(async (res) => {
				return JSON.parse(await res.text()) as LocationInfo
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
			})
	}

	/**
	 * Gets the latest samples for all devices in a location
	 * @returns {LocationReadings}
	 */
	public async getLocationSamples(
		locationId: string,
	): Promise<LocationSamples> {
		if (this.isTokenExpired()) await this.updateToken()
		if (!this.accessToken) throw new Error('No access token')

		return await fetch(
			`https://ext-api.airthings.com/v1/locations/${locationId}/latest-samples`,
			{
				headers: {
					Authorization: `Bearer ${this.accessToken.token}`,
				},
			},
		)
			.then(async (res) => {
				return JSON.parse(await res.text()) as LocationSamples
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
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
			.then(async (res) => {
				const data = JSON.parse(await res.text()) as {
					access_token: string
					token_type: string
					expires_in: number
				}
				const token: AccessToken = {
					token: data.access_token,
					type: data.token_type,
					expiresAt: data.expires_in + Date.now(),
				}
				return token
			})
			.catch((error: { message: string }) => {
				throw this.handleError(error)
			})
	}

	private handleError(error: { message: string }): Error {
		console.log(error)
		return new Error(`airthings-api error: ${error.message}`)
	}
}
