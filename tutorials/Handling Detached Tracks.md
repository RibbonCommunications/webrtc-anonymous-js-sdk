[COPYRIGHT © 2024 RIBBON COMMUNICATIONS OPERATING COMPANY, INC. ALL RIGHTS RESERVED]: #

# Handling Detached Tracks

In this quickstart we will cover how to handle detached media tracks with the Javascript SDK. Code snippets will be used to demonstrate these features, and together these snippets will form a working demo application that can be viewed at the end.

A detached track is an audio, video or screenshare track created outside of a call. Some uses for detached tracks could be previewing video and screensharing or testing microphone input.

## User Interface

To interact with our demo application, we will have a UI that allows us to preview our audio/video as well as screensharing.

```html
<div>
  <fieldset>
    <legend>Preview audio/video</legend>
    <div class="bottomSpacing">
      <!-- UI for starting audio/video preview. -->
      <input id='preview-av-button' type="button" value="Preview audio/video" onclick="previewAudioVideo();" />
      <!-- UI for ending audio/video preview. -->
      <input id='end-preview-av-button' type="button" value="End preview" onclick="endAudioVideoPreview();" disabled />
    </div>
    <div id="video-preview-container"></div>
  </fieldset>
  <fieldset>
    <legend>Preview screenshare</legend>
    <div class="bottomSpacing">
      <!-- UI for starting screenshare preview. -->
      <input id='preview-screenshare-button' type="button" value="Preview screenshare" onclick="previewScreenshare();" />
      <!-- UI for ending screenshare preview. -->
      <input id='end-preview-screenshare-button' type="button" value="End preview" onclick="endScreensharePreview();" disabled />
    </div>
    <div id="screenshare-preview-container"></div>
  </fieldset>
</div>
```

```html
<div>
  <fieldset>
    <!-- Message output container. -->
    <legend>Messages</legend>
    <div id="messages"></div>
  </fieldset>
</div>
```

To display information to the user, a `log` function will be used to append new messages to the "messages" element shown above.

## Start / Stop Audio/Video preview

### Start preview

To start previewing audio/video, we'll have the user click the 'Preview audio/video' button. This will trigger the `previewAudioVideo` function shown below. This function does two simple steps to start the preview:

1. Calls the `media.createLocalMedia` API passing in a `mediaConstraints` object indicating that we want to create an audio and a video track in our media.
2. Calls the `media.renderTracks` API for each track that was just created to have the media rendered in an HTML element.

An array of media tracks will be returned from the `media.createLocalMedia` API, representing the tracks that have been created

```javascript
// Get user input to create detached tracks to preview audio and video.
function previewAudioVideo () {
  client.media.createLocalMedia({ audio: true, video: true }).then(medias => {
    medias.forEach(media => {
      const tracks = media.media.getTracks()
      tracks.forEach(track => audioVideoTrackIds.push(track.id))
    })

    client.media.renderTracks(audioVideoTrackIds, '#video-preview-container')
    audioVideoTrackIds.forEach(trackId => log('Track rendered: ' + trackId))
    disableInput(document.getElementById('preview-av-button'), true)
    disableInput(document.getElementById('end-preview-av-button'), false)
  }).catch(error => {
    log('Error: ' + error.message)
  })
}
```

### Stop Preview

Similar to starting a preview, if we want to stop the preview, the user can click the 'End preview' button, and our `endAudioVideoPreview` function shown below will dispose the local audio and video tracks. This will stop access to the camera and microphone hardware.

```javascript
// End audio/video preview
function endAudioVideoPreview () {
  audioVideoTrackIds.forEach(trackId => {
    client.media.disposeLocalMedia(trackId)
    log('Track disposed: ' + trackId)
  })
  disableInput(document.getElementById('preview-av-button'), false)
  disableInput(document.getElementById('end-preview-av-button'), true)
}
```

## Start / Stop Screenshare preview

### Start preview

To start previewing a screenshare, we'll have the user click the 'Preview screenshare' button. This will trigger the `previewScreenshare` function shown below. This function does two simple steps to start the preview:

1. Calls the `media.createLocalMedia` API passing in a `mediaConstraints` object indicating that we want to create a screenshare track in our media. Calling this API will trigger your browser to prompt you to select which screen, window or browser tab you want to share. After making a selection, a new video track will be created, displaying the screen you selected to share.
2. Calls the `media.renderTracks` API for the track that was just created to have the media rendered in an HTML element.

```javascript
// Get user input to create a detached track to preview screenshare.
function previewScreenshare () {
  client.media.createLocalMedia({ screen: true }).then(medias => {
    medias.forEach(media => {
      const tracks = media.media.getTracks()
      tracks.forEach(track => screenshareTrackId.push(track.id))
    })

    client.media.renderTracks(screenshareTrackId, '#screenshare-preview-container')
    screenshareTrackId.forEach(trackId => log('Track rendered: ' + trackId))
    disableInput(document.getElementById('preview-screenshare-button'), true)
    disableInput(document.getElementById('end-preview-screenshare-button'), false)
  }).catch(error => {
    log('Error: ' + error.message)
  })
}
```

### Stop Preview

Similar to starting a preview, if we want to stop the preview, the user can click the 'End preview' button, and out `endScreensharePreview` function shown below will dispose the local screenshare track.

```javascript
// End the screenshare preview
function endScreensharePreview () {
  screenshareTrackId.forEach(trackId => {
    client.media.disposeLocalMedia(trackId)
    log('Track disposed: ' + trackId)
  })
  disableInput(document.getElementById('preview-screenshare-button'), false)
  disableInput(document.getElementById('end-preview-screenshare-button'), true)
}
```

### Cleaning up detached tracks

Disposing a track by calling the `media.disposeLocalMedia` API will only stop the media playing in the track. Your application should also stop rendering the track into an HTML element. This can be done by calling the `media.removeTracks` API as you can see below. You must provide an array of tracks to remove and the HTML element (container) to stop rendering the media in.

```javascript
// Cleanup detached tracks when they have ended.
function cleanupTrack (track, container) {
  client.media.removeTracks([track], container)
  log('Track unrendered: ' + track)
}
```

## Events

The only media event you need to listen for is the `media:trackEnded` event. This event will let the application know when a track has been stopped, for example by calling the `media.disposeLocalMedia` API. This event should be handled by stopping rendering for the track that has ended by calling the `media.removeTracks` API shown above.

```javascript
// Setup a listener for ended media tracks.
client.on('media:trackEnded', function (params) {
  let container
  if (audioVideoTrackIds && audioVideoTrackIds.includes(params.trackId)) {
    container = '#video-preview-container'
  }
  if (screenshareTrackId && screenshareTrackId.includes(params.trackId)) {
    container = '#screenshare-preview-container'
  }
  cleanupTrack(params.trackId, container)
})
```

## Live Demo

Want to play around with this example for yourself? Feel free to edit this code on Codepen.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Handling detached media Demo\n */\n\nconst defaultConfig = {\n  authentication: {\n    server: {\n      base: &apos;blue.rbbn.com&apos;\n    }\n  }\n}\n\nconst { create } = WebRTC\n\n// Setup the SDK with default configuration.\n// As part of configuration, we&apos;ll further apply some customization for logging.\nconst config = {\n  ...defaultConfig,\n  logs: {\n    logLevel: &apos;debug&apos;\n  }\n}\n\nconst client = create(config)\n\n// Enable/disable element\nfunction disableInput (element, disable) {\n  element.disabled = disable\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\nlet audioVideoTrackIds = []\nlet screenshareTrackId = []\n\n\n// Get user input to create detached tracks to preview audio and video.\nfunction previewAudioVideo () {\n  client.media.createLocalMedia({ audio: true, video: true }).then(medias => {\n    medias.forEach(media => {\n      const tracks = media.media.getTracks()\n      tracks.forEach(track => audioVideoTrackIds.push(track.id))\n    })\n\n    client.media.renderTracks(audioVideoTrackIds, &apos;#video-preview-container&apos;)\n    audioVideoTrackIds.forEach(trackId => log(&apos;Track rendered: &apos; + trackId))\n    disableInput(document.getElementById(&apos;preview-av-button&apos;), true)\n    disableInput(document.getElementById(&apos;end-preview-av-button&apos;), false)\n  }).catch(error => {\n    log(&apos;Error: &apos; + error.message)\n  })\n}\n\n// End audio/video preview\nfunction endAudioVideoPreview () {\n  audioVideoTrackIds.forEach(trackId => {\n    client.media.disposeLocalMedia(trackId)\n    log(&apos;Track disposed: &apos; + trackId)\n  })\n  disableInput(document.getElementById(&apos;preview-av-button&apos;), false)\n  disableInput(document.getElementById(&apos;end-preview-av-button&apos;), true)\n}\n\n// Get user input to create a detached track to preview screenshare.\nfunction previewScreenshare () {\n  client.media.createLocalMedia({ screen: true }).then(medias => {\n    medias.forEach(media => {\n      const tracks = media.media.getTracks()\n      tracks.forEach(track => screenshareTrackId.push(track.id))\n    })\n\n    client.media.renderTracks(screenshareTrackId, &apos;#screenshare-preview-container&apos;)\n    screenshareTrackId.forEach(trackId => log(&apos;Track rendered: &apos; + trackId))\n    disableInput(document.getElementById(&apos;preview-screenshare-button&apos;), true)\n    disableInput(document.getElementById(&apos;end-preview-screenshare-button&apos;), false)\n  }).catch(error => {\n    log(&apos;Error: &apos; + error.message)\n  })\n}\n\n// End the screenshare preview\nfunction endScreensharePreview () {\n  screenshareTrackId.forEach(trackId => {\n    client.media.disposeLocalMedia(trackId)\n    log(&apos;Track disposed: &apos; + trackId)\n  })\n  disableInput(document.getElementById(&apos;preview-screenshare-button&apos;), false)\n  disableInput(document.getElementById(&apos;end-preview-screenshare-button&apos;), true)\n}\n\n// Cleanup detached tracks when they have ended.\nfunction cleanupTrack (track, container) {\n  client.media.removeTracks([track], container)\n  log(&apos;Track unrendered: &apos; + track)\n}\n\n// Setup a listener for ended media tracks.\nclient.on(&apos;media:trackEnded&apos;, function (params) {\n  let container\n  if (audioVideoTrackIds && audioVideoTrackIds.includes(params.trackId)) {\n    container = &apos;#video-preview-container&apos;\n  }\n  if (screenshareTrackId && screenshareTrackId.includes(params.trackId)) {\n    container = &apos;#screenshare-preview-container&apos;\n  }\n  cleanupTrack(params.trackId, container)\n})\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://unpkg.com/@rbbn/webrtc-anonymous-js-sdk@6.16.0/dist/webrtc.js\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Preview audio/video</legend>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- UI for starting audio/video preview. -->\n      <input id=&apos;preview-av-button&apos; type=\&quot;button\&quot; value=\&quot;Preview audio/video\&quot; onclick=\&quot;previewAudioVideo();\&quot; />\n      <!-- UI for ending audio/video preview. -->\n      <input id=&apos;end-preview-av-button&apos; type=\&quot;button\&quot; value=\&quot;End preview\&quot; onclick=\&quot;endAudioVideoPreview();\&quot; disabled />\n    </div>\n    <div id=\&quot;video-preview-container\&quot;></div>\n  </fieldset>\n  <fieldset>\n    <legend>Preview screenshare</legend>\n    <div class=\&quot;bottomSpacing\&quot;>\n      <!-- UI for starting screenshare preview. -->\n      <input id=&apos;preview-screenshare-button&apos; type=\&quot;button\&quot; value=\&quot;Preview screenshare\&quot; onclick=\&quot;previewScreenshare();\&quot; />\n      <!-- UI for ending screenshare preview. -->\n      <input id=&apos;end-preview-screenshare-button&apos; type=\&quot;button\&quot; value=\&quot;End preview\&quot; onclick=\&quot;endScreensharePreview();\&quot; disabled />\n    </div>\n    <div id=\&quot;screenshare-preview-container\&quot;></div>\n  </fieldset>\n</div>\n\n<div>\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;video {\n  width: 50% !important;\n}\n\n.bottomSpacing {\n  margin-bottom: 15px;\n}\n\n&quot;,&quot;title&quot;:&quot;Javascript SDK Handling detached media Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

[COPYRIGHT © 2024 RIBBON COMMUNICATIONS OPERATING COMPANY, INC. ALL RIGHTS RESERVED]: #

