# AIRTHINGS API
**This is an unofficial open source package not associated with AIRTHINGS**

## Install

```bash 
npm install airthings-api
```

## Creating an Integration

You will need to access your AIRTHINGS dashboard to set up an integration by going [here](https://dashboard.airthings.com/integrations/api-integration/add-api-client). After you have created your integration, you will need to copy your `ClientId` and `Secret`. 

## Usage

```typescript
import { AirThingsApi } from "airthings-api";

(async () => {
    const client = new AirThingsApi({
        id: '[YOUR_CLIENT_ID]',
        secret: '[YOUR_CLIENT_SECRET]',
    })
    
    // provides a list of Device
    const devices = await client.getDeviceList()
    // provides more detail about the individual Device
    const device = await client.getDevice(devices[0].id)
    // provides samples from the Device 
    const deviceSamples = await client.getDeviceSamples(device.id)

    console.log(deviceSamples)

    // provides a list of Location
    const locations = await client.getLocations()
    // provides more detail about the individual Location
    const location = await client.getLocation(locations[0].id)
    // provides readings for all Device in the Location
    const locationSamples = await client.getLocationSamples(location.id)

    console.log(locationSamples)
})()
```