# Call Reports
A call report can be created for any call, in any state. The report is in JSON format and will contain the following information.

- Timeline of events that occured during the call.
- Operation timings and additional contextual data are recorded as metrics.

## Elements of a call report
- **type**: The type of report will always be `CALL`.
- **id**: This is the call id of the call associated with this report.
- **timeline**: This is an array of top level events that occured during the call. These events correspond to the operations that have been performed.
- **data**: This contains any meta data related to this call.
- **metrics**: This is an array of objects that contain calculated metrics for specific operations during the call.

## What is an event?
An event represents some functionality that has been executed during a call. Top level events will be found in the call report's timeline array. Events can also have their own sub events. These sub events will be stored in an events timeline array and follow the same format as top level events. This is how we scope events so it is clear which events occurred as part of higher level events.

## Elements of an event
- **type**: The type of event.
- **id**: A unique id representing a specific event.
- **timeline**: This is an array of sub events that have occured as part of this event.
- **data**: This contains any meta data related to this event.
- **metrics**: This is an array of objects that contain calculated metrics specific to this event.
- **start**: This is a timestamp created when this event started.
- **end**: This is a timestamp created when this event ended.

## Events that the SDK records
**ANSWER**

Starts when the answer operation starts. Ends when the answer operation finishes. This event will only be seen in the callee's report

**REJECT**

Starts when the reject operation starts. Ends when the reject operation finishes.

**IGNORE**

Starts when the ignore operation starts. Ends when the ignore operation finishes.

**SEND_RINGING_FEEDBACK**

Starts when the send ringing feedback operation starts. Ends when the ringing feedback operation finishes.

**FORWARD_CALL**

Starts when the forward call operation starts. Ends when the forward operation finishes.

**HOLD**

Starts when the hold operation starts. Ends when the hold operation finishes.

**UNHOLD**

Starts when the unhold operation starts. Ends when the unhold operation finishes.

**SEND_CUSTOM_PARAMETERS**

Starts when the send custom parameters operation starts. Ends send custom parameters operation finishes.

**ADD_MEDIA**

Starts when the add media operation starts. Ends when the add media operation finishes.

**ADD_BASIC_MEDIA**

Starts when the add basic media operation starts. Ends when the add basic media operation finishes.

**REMOVE_MEDIA**

Starts when the remove media operation starts. Ends when the remove media operation finishes.

**REMOVE_BASIC_MEDIA**

Starts when the remove basic media operation starts. Ends when the remove basic operation finishes.

**GET_STATS**

Starts when the get stats operation starts. Ends when the get stats operation finishes.

**SEND_DTMF**

Starts when the send DTMF operation starts. Ends when the DTMF operation finishes.

**CONSULTATIVE_TRANSFER**

Starts when the consultative transfer operation starts. Ends when the consultative transfer operation finishes.

**DIRECT_TRANSFER**

Starts when the direct transfer operation starts. Ends when the direct transfer operation finishes.

**JOIN**

Starts when the join operation starts. Ends when the join operation finishes.

**REPLACE_TRACK**

Starts when the replace track operation starts. Ends when the replace track operation finishes.

**MEDIA_RESTART**

Starts when the media restart operation starts. Ends when the media restart operation finishes.

**RESYNC**

Starts when the resync operation starts. Ends when the resync operation finishes.

**PLAY_AUDIO**

Starts when the play audio operation starts. Ends when the play audio operation finishes.

**GET_AVAILABLE_CODECS**

Starts when the get available codecs operation starts. Ends when the get available codecs operation finishes.

**START_MOH**

Starts when the start music on hold operation starts. Ends when the start music on hold operation finishes.

**STOP_MOH**

Starts when the stop music on hold operation starts. Ends when the stop music on hold operation finishes.

**SLOW_START**

Starts when the slow start operation starts. Ends when the slow stop operation finishes.

**END**

Starts when the end operation starts. Ends when the end operation finishes.

**callStatusUpdateEnded**

Starts when the call status update ended operation starts. Ends when the call status update ended operation finishes.

## What is a metric?
A metric is a representation of computed data that provides statistical information about an event or series of events. Most of the metrics computed by the SDK will be simple numbers that represent a duration (in milliseconds), or how long it took for something to complete.

## Elements of a metric
- **type**: The type of metric being calculated.
- **data**: The computed data for a metric.
- **eventIds**: An array of id's that contributed to the calculation of this metric.

## Metrics that the SDK computes
**CALL_DURATION**

The duration of a completed call starting from the make call API call or incoming call notification until the call ends.

**MAKE_CALL_LOCAL_SETUP**

The amount of time it takes from when a call is made until the call is setup locally. This does not include any remote session creation.

**MAKE_CALL_REMOTE_SETUP**

The amount of time it takes from when the create session request is sent until the SDK processes the response.

**TIME_TO_ANSWER**

The amount of time it takes from when a call is made until the SDK receives and processes the remote response.

**TIME_TO_MEDIA_DURATION**

The amount of time it takes from answering an incoming call until media is connected.

**TIME_TO_CALL_SETUP_DURATION**

The amount of time it takes from when the SDK recieves an incoming call notification until media is connected. This includes the answer operation.

**TIME_TO_IGNORE**

The amount of time it takes for the ignore call to complete.

**TIME_TO_REJECT**

The amount of time it takes for the reject call to complete.

**TIME_TO_RINGING**

The amount of time it takes from when a call is made until the SDK recieves the remote ringing notification.

**TIME_TO_REMOVE_MEDIA**

The amount of time it takes from when the `remove media` operation starts until the local description has been set.

**TIME_TO_REMOVE_MEDIA_REMOTE**

The amount of time it takes from when the `remove media` notification handling starts until the remote description has been set.

**TIME_TO_ADD_MEDIA**

The amount of time it takes from when the `add media` operation starts until the local description has been set.

**TIME_TO_ADD_MEDIA_REMOTE**

The amount of time it takes from when the `add media` notification handling starts until the remote description has been set.

**TIME_TO_RESTART_MEDIA**

The amount of time it takes from when the `restart media` operation starts until media has been restarted.

**TIME_TO_RELAY_CANDIDATES**

The amount of time it takes from when the `ice collection` operation starts until each relay candidate has been recieved.

**TIME_TO_SEND_CUSTOM_PARAMETERS**

The amount of time it takes from when the `send custom parameters` operation starts until it has finished.

**TIME_TO_FORWARD**

The amount of time it takes from when the `forward call` operation starts until it has finished.

**TIME_TO_DIRECT_TRANSFER**

The amount of time it takes from when the `direct transfer` operation starts until it has finished.

**TIME_TO_JOIN**

The amount of time it takes from when the `join call` operation starts until it has finished.

## Obtaining a call report
To get a call report for a call, you simply call the `client.call.getReport(callId)` API function. You must provide an existing `callId` and when called, it will return a javascript object containing all recorded call events and any metrics computed for the call. For this demo, we'll add a button to enable us to download the call report. You can use it once the call started, any time during the call and even after call ended.

```html
<input disabled type="submit" id="call-report" value="Download Call Report" onclick="downloadCallReport()" /> <br />
<br />
```

```javascript
/**
 * Function for providing the call report to a user via a downloaded file.
 * @method downloadCallReport
 */
function downloadCallReport () {
  const callReport = client.call.getReport(callId)

  // Convert the saved call stats into a JSON blob.
  const blob = new Blob([JSON.stringify(callReport, null, 2)], { type: 'application/json' })

  // Create a button that will save the Blob as a file when clicked.
  const button = document.createElement('a')
  button.href = URL.createObjectURL(blob)
  // Give the file a name.
  button.download = Date.now().toString() + '_sdk' + client.getVersion() + '_call_report.json'

  // Auto-click the button.
  button.click()
}
```

## Live Demo

Want to try this example for yourself? Click the button below to get started.

<form action="https://codepen.io/pen/define" method="POST" target="_blank" class="codepen-form"><input type="hidden" name="data" value=' {&quot;js&quot;:&quot;/**\n * Javascript SDK Call Reports Demo\n */\n\nconst defaultConfig = {\n  call: {\n    defaultPeerConfig: {\n      iceServers: [{ urls: &apos;$RIBBONTURN1$&apos; }, { urls: &apos;$RIBBONSTUN1$&apos; }]\n    },\n    // Specify that credentials should be fetched from the server.\n    serverTurnCredentials: true\n  },\n  authentication: {\n    subscription: {\n      service: [&apos;call&apos;],\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    },\n    websocket: {\n      server: &apos;$SUBSCRIPTIONFQDN$&apos;\n    }\n  },\n  logs: {\n    logLevel: &apos;debug&apos;,\n    logActions: {\n      actionOnly: false,\n      exposePayloads: true\n    }\n  }\n}\n\nconst { create } = WebRTC\n\nconst client = create(defaultConfig)\n\nfunction toggleVisibilityOnUserFields () {\n  let chbox = document.getElementById(&apos;make-token-based-anonymous-call&apos;)\n  let visibility = &apos;block&apos;\n  if (chbox.checked) {\n    visibility = &apos;none&apos;\n  }\n  document.getElementById(&apos;callerSection&apos;).style.display = visibility\n  document.getElementById(&apos;calleeSection&apos;).style.display = visibility\n}\n\n// Utility function for appending messages to the message div.\nfunction log (message) {\n  document.getElementById(&apos;messages&apos;).innerHTML += &apos;<div>&apos; + message + &apos;</div>&apos;\n}\n\n// Variable to keep track of the call.\nlet callId\n\n// If call is a regular anonymous one, then we&apos;ll use caller & callee\n// values, as provided by user (in the text fields of this UI).\n// If call is a token-based anonymous one, then caller & callee will\n// be obtained from our Node.js https server.\nasync function makeAnonymousCall () {\n  let makeATokenBasedAnonymousCall = document.getElementById(&apos;make-token-based-anonymous-call&apos;).checked\n\n  let caller = document.getElementById(&apos;caller&apos;).value\n  if (!caller && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the caller.&apos;)\n    return\n  }\n\n  let callee = document.getElementById(&apos;callee&apos;).value\n  if (!callee && !makeATokenBasedAnonymousCall) {\n    // For regular anonymous call, ask user to fill in the value\n    log(&apos;Error: Please provide the primary contact for the callee.&apos;)\n    return\n  }\n\n  // For regular anonymous call, there is no need for credentials\n  let credentials = {}\n\n  // Define our call options. Assume for now it is for a regular anonymous call.\n  const callOptions = {\n    from: caller,\n    video: false,\n    audio: true\n  }\n  if (makeATokenBasedAnonymousCall) {\n    // Before attempting to trigger outgoing call, get the actual token values\n    // from expressjs application server in order to make a token-based anonymous call.\n    const getTokensRequestUrl = &apos;https://localhost:3000/callparameters&apos;\n    let result = await fetch(getTokensRequestUrl)\n    let data = await result.json()\n\n    let accountToken = data.accountToken\n    let fromToken = data.fromToken\n    let toToken = data.toToken\n    let realm = data.realm\n\n    caller = data.caller\n    callee = data.callee\n\n    callOptions[&apos;from&apos;] = caller\n\n    log(&apos;Got Account Token: &apos; + accountToken)\n    log(&apos;Got From Token:    &apos; + fromToken)\n    log(&apos;Got To Token:      &apos; + toToken)\n    log(&apos;Got Realm:         &apos; + realm)\n    log(&apos;Got Caller:        &apos; + caller)\n    log(&apos;Got Callee:        &apos; + callee)\n\n    // Build our credentials object.\n    credentials = {\n      accountToken,\n      fromToken,\n      toToken,\n      realm\n    }\n    log(&apos;Making a token-based anonymous call to &apos; + callee)\n  } else {\n    // For regular anonymous calls, no extra information is needed.\n    log(&apos;Making a regular anonymous call to &apos; + callee)\n  }\n\n  // Finally, trigger the outgoing anonymous call.\n  callId = client.call.makeAnonymous(callee, credentials, callOptions)\n}\n\n// End an ongoing call.\nfunction endCall () {\n  // Retrieve call state.\n  let call = client.call.getById(callId)\n  log(&apos;Ending call with &apos; + call.to)\n\n  client.call.end(callId)\n}\n\n// Set listener for generic call errors.\nclient.on(&apos;call:error&apos;, function (params) {\n  log(&apos;Error: Encountered error on call: &apos; + params.error.message)\n})\n\nclient.on(&apos;media:error&apos;, function (params) {\n  log(&apos;Call encountered media error: &apos; + params.error.message)\n})\n\n// Set listener for changes in a call&apos;s state.\nclient.on(&apos;call:stateChange&apos;, function (params) {\n  // Retrieve call state.\n  const call = client.call.getById(params.callId)\n\n  if (params.error && params.error.message) {\n    log(&apos;Error: &apos; + params.error.message)\n  }\n  log(&apos;Call state changed from &apos; + params.previous.state + &apos; to &apos; + call.state)\n})\n\n// Set listener for successful call starts\nclient.on(&apos;call:start&apos;, function (params) {\n  log(&apos;Call successfully started. Waiting for response.&apos;)\n  document.getElementById(&apos;call-report&apos;).disabled = false\n})\n\n// Set listener for new tracks.\nclient.on(&apos;call:tracksAdded&apos;, function (params) {\n  params.trackIds.forEach(trackId => {\n    const track = client.media.getTrackById(trackId)\n\n    // Check whether the new track was a local track or not.\n    if (!track.isLocal) {\n      // Only render the remote audio into the remote container.\n      // Don&apos;t render the local audio so the end-user doesn&apos;t hear themselves.\n      client.media.renderTracks([trackId], &apos;#remote-container&apos;)\n    }\n  })\n})\n\n// Set listener for ended tracks.\nclient.on(&apos;call:trackEnded&apos;, function (params) {\n  // Check whether the ended track was a local track or not.\n  if (!params.local) {\n    // Remove the track from the remote container.\n    client.media.removeTracks([params.trackId], &apos;#remote-container&apos;)\n  }\n})\n\n/**\n * Function for providing the call report to a user via a downloaded file.\n * @method downloadCallReport\n */\nfunction downloadCallReport () {\n  const callReport = client.call.getReport(callId)\n\n  // Convert the saved call stats into a JSON blob.\n  const blob = new Blob([JSON.stringify(callReport, null, 2)], { type: &apos;application/json&apos; })\n\n  // Create a button that will save the Blob as a file when clicked.\n  const button = document.createElement(&apos;a&apos;)\n  button.href = URL.createObjectURL(blob)\n  // Give the file a name.\n  button.download = Date.now().toString() + &apos;_sdk&apos; + client.getVersion() + &apos;_call_report.json&apos;\n\n  // Auto-click the button.\n  button.click()\n}\n\n&quot;,&quot;html&quot;:&quot;<script src=\&quot;https://cdn.jsdelivr.net/gh/RibbonCommunications/webrtc-anonymous-js-sdk@6.1.0-beta.1087/dist/webrtc.js\&quot;></script>\n<script src=\&quot;$DEFAULTCONFIGURL$\&quot;></script>\n\n<div>\n  <fieldset>\n    <legend>Make an Anonymous Call</legend>\n\n    <!-- User input for making a call. -->\n    <div style=\&quot;margin-bottom: 5px\&quot;>\n      <input type=\&quot;button\&quot; value=\&quot;Make Call\&quot; onclick=\&quot;makeAnonymousCall();\&quot; />\n      <div style=\&quot;margin-left: 20px\&quot; id=\&quot;calleeSection\&quot;>\n        to <input id=\&quot;callee\&quot; type=\&quot;text\&quot; placeholder=\&quot;Callee&apos;s primary contact\&quot; />\n      </div>\n    </div>\n\n    <div id=\&quot;callerSection\&quot; style=\&quot;margin-left: 20px\&quot;>\n      Caller: <input id=\&quot;caller\&quot; type=\&quot;text\&quot; placeholder=\&quot;Caller&apos;s primary contact\&quot; />\n    </div>\n\n    <div>\n      Make a token-based call\n      <input type=\&quot;checkbox\&quot; id=\&quot;make-token-based-anonymous-call\&quot; onclick=\&quot;toggleVisibilityOnUserFields();\&quot; />\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>End an Anonymous Call</legend>\n    <!-- User input for ending an ongoing call. -->\n    <input type=\&quot;button\&quot; value=\&quot;End Call\&quot; onclick=\&quot;endCall();\&quot; />\n  </fieldset>\n  <div id=\&quot;remote-container\&quot;></div>\n\n  <br />\n  <div>Call Report</div>\n</div>\n\n<input disabled type=\&quot;submit\&quot; id=\&quot;call-report\&quot; value=\&quot;Download Call Report\&quot; onclick=\&quot;downloadCallReport()\&quot; /> <br />\n<br />\n\n  <fieldset>\n    <!-- Message output container. -->\n    <legend>Application Messages</legend>\n    <div id=\&quot;messages\&quot;></div>\n  </fieldset>\n</div>\n\n&quot;,&quot;css&quot;:&quot;&quot;,&quot;title&quot;:&quot;Javascript SDK Call Reports Demo&quot;,&quot;editors&quot;:101} '><input type="image" src="./TryItOn-CodePen.png"></form>

_Note: You’ll be sent to an external website._

