import { Device, DeviceSegment } from "./device"
import { Samples } from "./samples"

export interface Location {
    id: string
    name: string
}

export interface LocationInfo extends Location {
    labels: object
    devices: Device[]
    lat: number
    lng: number
    address?: string 
    buildingHeight?: number
    buildingSize?: number
    buildingType?: string
    buildingVolume?: number
    buildingYear?: number
    countryCode?: string
    floors?: number
    timezone?: string
    usageHours?: object
    ventilationType?: object
}

export interface LocationSamples extends Location {
    id: string
    name: string
    devices: {
        id: string
        data: Samples
        segment: DeviceSegment
    }[]
}