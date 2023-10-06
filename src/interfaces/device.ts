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
