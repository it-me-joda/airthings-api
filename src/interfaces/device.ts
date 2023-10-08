import { Location } from './location'

export interface Device {
	id: string
	deviceType: string
	location: Location
	sensors: string[]
	segment: DeviceSegment
}

export interface DeviceSegment {
	id: string
	name: string
	started: string
	active: boolean
}