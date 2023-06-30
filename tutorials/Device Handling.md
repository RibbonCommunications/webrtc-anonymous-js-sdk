[COPYRIGHT © 2023 RIBBON COMMUNICATIONS OPERATING COMPANY, INC. ALL RIGHTS RESERVED]: #
---
layout: page
categories: quickstarts-javascript
title: Handling Devices
permalink: /quickstarts/javascript/newCallMe/Handling%20Devices
---

# Device Handling

In this quickstart we will cover how to handle devices with the Javascript SDK. Handling devices is not a required functionality in the sdk. This tutorial helps give an understanding on how devices work with calls or non-related call operations and retrieving information about the available devices. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

For information about other call features, such as starting calls and mid-call operations, please refer to their respective quickstarts.

## Get Devices

To get the list of available devices and information, you simply call the `client.media.getDevices()` API function. When called, it will return an Object with a list for each device type i.e microphone, cameras, speakers. Device lists can be different based on the browser used. For instance, a device in the list can also be added by the browser again as a default device. Included in the device information is the `deviceId` and the `label` of the device, which are both strings. If this list is empty, there can be the possibility of no device present or you don't have permission to access the user's devices and due to this, the label property for the device can be an empty string.

```javascript 
function getDevices () {
  // Get the media devices currently available for use.
  const devices = client.media.getDevices()

  // They are organized in arrays by their device type.
  const { microphone, camera, speaker } = devices

  // Each device has details to identify it, notably a label and unique ID.
  const { label, deviceId } = microphone[0]

  // For some browsers, the details won't be provided unless the end-user has
  //    granted permission to access the devices. That is why we need to
  //    initialize the devices in some cases.
}
```

## Initializing Devices

The `client.media.initializeDevices` API is not required during call setup and will trigger the browser to ask the end-user for permission to access their camera and/or microphone. This gives the browser/application access to the device early, so that the end-user doesn't need to be prompted when they make a call. The API function takes parameters and the application will still need to specify the deviceId when making/answering a call. These permissions could be denied by the end-user and if denied, the list would not have that device using the `client.media.getDevices()` API to get the list of devices.

Note: The API will will trigger an event to let the application know the device list has been updated.

```javascript
/*
 * Call the API to initialize media devices. The browser may prompt the end-user
 *    with a pop-up to grant device permission, if not already allowed.
 * This operation will either trigger a `devices:change` or `devices:error` event,
 *    based on whether the SDK was granted permission or not.
 */
function initializeDevices () {
  // Can request permission for audio and/or video input devices.
  const initAudio = document.getElementById('init-audio').checked
  const initVideo = document.getElementById('init-video').checked

  client.media.initializeDevices({ audio: initAudio, video: initVideo })
}
```

## Selecting Your Device on Call Setup

To learn how to start or answer a call, refer to the [Voice and Video Calls tutorial](Voice%20and%20Video%20Calls). The microphone and/or camera can be chosen when starting a call. The IDs for each device in the media object can be passed as parameters to the `client.call.make` or `client.call.answer` call APIs, see below. Those IDs determine which microphone or camera will be used when starting the call. In the case of the speakers, this will be chosen when the audio track is rendered with the `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

During a call setup, the `client.call.make` API has a different parameter for media options. Included in the media options is the `call.MediaConstraints` object, which defines the format for configuring the media options, see the `Call` API documentation.

Note: The constraints can use either the ideal or exact property. If the exact value cannot be used, the constraint will be considered an error. But in the case of the ideal property, the closest acceptable value will be used instead.

See below for how the media options should be formatted and how to make/answer call with a device.

```javascript 
async function makeAnonymousCall () {
  // Get media related options from UI.
  const withAudio = document.getElementById('make-with-audio').checked
  const withVideo = document.getElementById('make-with-video').checked
  const microphone = getSelectedDeviceId('microphone')
  const camera = getSelectedDeviceId('camera')

  // Determine the media options to provide to the API.
  const mediaOptions = {
    audio: withAudio,
    audioOptions: withAudio ? { deviceId: microphone } : undefined
    video: withVideo,
    videoOptions: withVideo ? { deviceId: camera } : undefined
  }

  // Do all of the other, non-media related things required for anonymous calls.
  // See the 'Anonymous Calls' tutorial for the explanation of this part.
  ...

  // Finally, trigger the outgoing anonymous call.
  callId = client.call.makeAnonymous(callee, credentials, mediaOptions)
}
```

## Changing Devices during a Call

To learn how to perform midcall operations, refer to the[Handling Media tutorial](Handling%20Media%20Tracks).

When adding a device (e.g. microphone and/or a camera) during an ongoing call, the `deviceId` for each device will need to be passed into the media object with the `client.call.addMedia` API. However, removing the device will require specifying the `trackId` and the `deviceId` in the media Object to the `client.call.replaceTrack` API as parameters.

The `client.call.replaceTrack` API completely replaces an old track with a new one, therefore old track's state characteristics are not carried over in the new track's state. (e.g. if an old track's state was 'muted' and replacement of this track has occured, the new track's state will be 'unmuted', as this is its default state)

To learn how to add/remove media, refer to [Handling Media Tracks](Handling%20Media%20Tracks). Changing the output device (i.e speakers) requires unrendering the the tracks using the `client.media.removeTracks` and re-rendering the track with `client.media.renderTracks` API by passing the speaker's `deviceId` to use for audio tracks.

Note: The `client.call.replaceTrack` API is the recommended way to change a device during a call but if that can't be done, the application should remove using `client.call.removeTracks` and then re-add a track in order to change its device.

```javascript
/**
 * Changes the device, of the specified type, being used on the call with
 *    the selected device of that type.
 */
function replaceDevice (type) {
  const call = client.call.getById(callId)
  const newDevice = getSelectedDeviceId(type)

  /*
   * Important: The method to change input devices vs. output devices is different.
   * For input devices (microphone, camera), you need to replace the track being
   *    used with a new track that is getting media from the new device.
   * For output devices (speakers), you simply need to re-render the existing
   *    track and specify the new device to use.
   */
  if (type === 'microphone' || type === 'camera') {
    // Determine whether its an audio or video track we are replacing based
    //    on the device type specified.
    const mediaType = type === 'microphone' ? 'audio' : 'video'

    // Determine the media options to be provided to the API.
    const mediaOptions =
      mediaType === 'audio'
        ? { audio: true, audioOptions: { deviceId: newDevice } }
        : { video: true, videoOptions: { deviceId: newDevice } }

    // Find the ID of the track we are replacing. For input devices, we act
    //    on our local tracks.
    const trackId = call.localTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === mediaType
    })

    // Replace the existing track with a new track using our selected device.
    client.call.replaceTrack(callId, trackId, mediaOptions)
  } else if (type === 'speaker') {
    // Find the ID of the track we want to change the speaker for. For output
    //    devices, we act on the remote tracks.
    const trackId = call.remoteTracks.find(id => {
      const track = client.media.getTrackById(id)
      return track.kind === 'audio'
    })

    // Unrender the remote audio track, then re-render it with the desired
    //    speaker device.
    client.media.removeTracks([trackId], '#remote-audio-container')
    client.media.renderTracks([trackId], '#remote-audio-container', {
      speakerId: newDevice
    })
  }
}
```

## Events

### devices:change

The `devices:change` event informs us when the media devices have changed and multiple things can also trigger this event. For instance, when initializing devices or connecting/disconnecting devices to the end-user's machine.

This would also be emitted during an ongoing call, if media devices changed. The `devices:error` event will be triggered when an error is encountered when using media devices. For instance, initializing devices or connecting/disconnecting devices to the end-user's machine could trigger these event if an error occurs. Also when the browser cannot find a media device that fulfills the `call.MediaConstraint` provided.

```javascript
/*
 * Listen for changes to the device lists. This will happen after devices have
 *    been initialized or if a device is added/removed from the end-user's machine.
 * When emitted, we want to updated our HTML device selectors using the
 *    updated lists.
 */
client.on('devices:change', () => {
  const devices = client.media.getDevices()
  log('Media devices have changed.')
  console.log('Full devices list: ', devices)

  const types = ['microphone', 'camera', 'speaker']
  types.forEach(type => {
    // Update our HTML select elements with the updated devices.
    updateSelector(type, devices[type])
  })
})

/*
 * Listen for device errors. This will happen either if permission is denied
 *   by the end-user when initializing devices, or if the SDK cannot get access
 *   to a device using the specified options when adding media to a call.
 */
client.on('devices:error', function (params) {
  log('An error occurred:' + params.error.message)
})
```

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

