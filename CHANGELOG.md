[copyright © 2024 ribbon communications operating company, inc. all rights reserved]: #

# Change Log

Ribbon WebRTC SDK change log.

- This project adheres to [Semantic Versioning](http://semver.org/).
- This change log follows [keepachangelog.com](http://keepachangelog.com/) recommendations.

## 7.5.0 - 2025-04-24

### Fixed

- Addressed browser support gap introduced by previous REST timeout solution. `KJS-2772`
- Fixed Call issues where a call's report would be missing events if their respective operation failed due to media validation. `KJS-2827`, `KJS-2828`
  - Fixed operations are: `addMedia` and `replaceTrack`.

## 7.4.0 - 2025-03-27

### Added

- A timeout is added to all REST requests made to the Gateway. `KJS-2703`
  - The default timeout value is 30 seconds.
  - The value is configurable via the `restTimeout` parameter under the new `request` section of configuration documentation.

### Fixed

- Fixed a Call issue where the `call.resync` API would trigger the Call resyncing operation twice, even though the API was called once. `KJS-2696`
- Fixed a Call issue where the audio or video track on the remote side will freeze if you try to add local media to the call after it has already been added previously (same track id). If you try to add the same track more than once, there will be an error on the `call:newMedia` event indicating that you can't add the same media more than once to a call. `KJS-2656`

### Changed

- Changed the media.getLocalMedia API to no longer be asynchronous. `KJS-2496`
  - It now returns the media objects directly instead of a promise that resolves with them.
- Changed the argument list passed to the `disposeLocalMedia` API. It now takes the same media object type that is returned by `createLocalMedia` and `getLocalMedia` APIs. `KJS-2523`

## 7.3.0 - 2025-02-26

### Fixed

- Fixed a Call issue where the `call.mediaRestart` API would not emit the `call:mediaRestart` event during certain error scenarios. `KJS-2530`
- Fixed a Call issue where improper call events were emitted when a hold operation encounters REST and rollback errors. `KJS-2508`
- Fixed a Call issue where a race-condition caused by network latency could cause a negotiation operation to incorrectly fail. `KJS-2615`

### Other Changes

This release also includes changes to a few other parts of the SDK. These changes should not be noticeable to an application following the call APIs' documentation, but are worth mentioning for awareness. A number of call APIs have been updated internally to enable better feedback to the application, which will translate to a better developer experience in the future.

The following call APIs have been updated internally: `hold`, `unhold`, `addMedia`, `removeMedia`, `restartMedia`, `addVideo`, `stopVideo`, `directTransfer`, `consultativeTransfer`, `join`, and `answer` for slow-start calls. In short, APIs that require input from both endpoints of the call are affected. Though not documented, call APIs have been returning promises since v6.0.0 (while being backwards-compatible if they were not handled; ie. never rejecting). The changes in v7.3.0 fix when the promise resolves to be after the _full_ operation is complete rather than solely the local portion. This change is only noticeable if your application was previously handling the promise resolve via a `.then` or `await`. `KJS-1856`

As always, if you encounter an issue with a release change, please report the issue to us.

## 7.2.0 - 2025-01-31

### Fixed

- Fixed an issue that prevented graceful call failure in case of server error. `KJS-2500`

## 7.1.1 - 2024-12-19

### Fixed

- Fixed an issue where we were always using the original full expiry time when trying to update a subscription after failing to update on the server. `KJS-2499`
- Fixed a Call issue where the call destination was being normalized even for an anonymous call. `KJS-2495`
  - This issue was introduced in v7.0.0.

## 7.0.0 - 2024-11-29

### Added

- Added a new status to the Call operation tracking: `RESOLVING`. `KJS-2304`
  - Previously, the `PENDING` status included both operation signalling and resolving the operation after receiving the remote response.
  - With the v7.0 changes, the `PENDING` status only represents operation signalling, and the `RESOLVING` status represents handling the remote response.
  - A new `call:operation` event will be emitted for call negotiation operations (eg. hold, add media) with the transition of `RESUME` to mark the change from `PENDING` to `RESOLVING` status.
  - For more information, please see the Migration section below.

### Removed

- Removed the `client.getServices` Authentication API. `KJS-2240`
  - The Subscription APIs, under `client.services`, should be used for retrieving information about the services.
- Removed the `client.getConnection` Authentication API. `KJS-2335`
  - The Subscription APIs, under `client.services` should be used to retrieve information about the user's connection to the backend.
  - If this API was used to retrieved the latest authentication error, the `auth:error` event should be used for that purpose.
- Removed the `platform` parameter from the `ws:change` event.
  - This parameter had become a constant and was no longer providing useful feedback.
- Removed Call documentation for APIs deprecated long ago (v4). `KJS-2450`
  - This API documentation was instructions for migrating from the deprecated APIs to the new APIs that covered that functionality. This information is no longer needed in our API documentation.
  - The APIs include: `changeInputDevices`, `changeSpeaker`, `startScreenshare`, and `stopScreenshare`.

### Fixed

- Fixed an issue where if a call join request fails, the peer connection that was created locally for the new joined call doesn't get cleaned up. `KJS-2373`

### Changed

- Code optimization has been turned on for the SDK which will minify the code. `KJS-2035`
- Changed the Connectivity configuration `connectivity.websocketOAuthMode` default from 'query' to 'none'. `KJS-2025`
  - This configuration is now opt-in instead of opt-out.
- Changed the event emitted when the anonymous user encounters an issue from `auth:change` to `subscription:change`. `KJS-2287`
  - This event for Gateway subscription issues is now consistent between the WebRTC Anonymous SDK and WebRTC SDK.
  - This event is emitted when the anonymous user loses their connection to the Gateway unexpectedly, for example when the websocket disconnects or the connection is closed by the Gateway.
- Changed the branding used in the metadata returned by `call.getStats` api, to use the WebRTC Anonymous JS SDK's most recent namings.

### Migration

#### Anonymous Subscription Events

Applications, that use Anonymous user accounts, will now have to listen to `subscription:change` event (instead of listening to `auth:change` event) as a way to determine when there is a change in their subscription status. The event payload stays the same, only the event type (that application listens to) needs to change in application's logic.

```javascript
// Example event listener for when an anonymous user is now informed that his/her subscription status has changed.
// After v7.0 changes.
client.on('subscription:change', function (params) {
  // Access the params.reason and call the application logic depending on the reason encountered, just like you did prior to v7.0 changes.
})
```

#### Call Operation Tracking

Previously, there were only three scenarios where the `call:operation` event was emitted. The v7.0 changes add a fourth scenario when the event can be emitted during operation progression.

If an application was listening for the `call:operation` event to track operation progression, then the event listener should be updated to take into account the v7.0 changes. Below is a snippet that shows how the event behaved pre- and post- v7.0.

```javascript
// Listener for tracking operation progression events.
client.on('call:operation', params => {
  // Relevant event parameters for the code change.
  const { transition, previous } = params

  // Relevant call property for code change is `operation.status`.
  const call = client.call.getById(params.callId)
  const operation = call.currentOperations.find(op => op.id === params.operationId)

  switch (transition) {
    case 'START': // The operation is starting.
    // previous.status === 'NOT_STARTED'
    // operation.status === 'ONGOING'
    case 'UPDATE': // The operation is now waiting on a remote response.
    // previous.status === 'ONGOING'
    // operation.status === 'PENDING'

    // New scenario with v7.0 changes.
    case 'RESUME': // The operation has received a remote response.
    // previous.status === 'PENDING'
    // operation.status === 'RESOLVING'

    case 'FINISH': // The operation has finished.
    // Values pre-v7.0
    // previous.status === 'PENDING' if the operation had an 'UPDATE'
    // previous.status === 'ONGOING' if the operation was local-only
    // operation === undefined

    // Values post-v7.0
    // previous.status === 'RESOLVING' if the operation had an 'UPDATE'
    // previous.status === 'ONGOING' if the operation was local-only
    // operation === undefined
  }
})
```

#### Authentication API Removal

The`client.getConnection` and `client.getServices` APIs have been removed in v7.0. Their functionality had been moved under the Subscription APIs, `client.services`, in the previous v6.0.0 release. The data that they return was no longer being updated with a user subscription, hence provide no useful functionality to an application. If these APIs are in use by your application, their usage should be revised.

### Other Changes

This release also includes changes to a few other parts of the SDK. These changes should not be noticeable to an application, but are worth mentioning for awareness. A number of features of the SDK have had their codebase renewed to better support the direction of the SDK going forward. This will translate to a better developer experience in the future.

The following features have been updated internally: Connectivity. They do not require any application changes as part of the release, as the changes are backwards-compatible. As always, if you encounter an issue with a release change, please report the issue to us.

## 6.16.1 - 2024-11-18

### Fixed

- The make, answer, addMedia and replaceTrack APIs were throwing an error if parameter validation failed. This has been fixed to include the error in the event that is emitted instead of throwing.
  - This issue was introduced in the v6.12.0. `KJS-2422`
- Fixed a Call issue where destroying the SDK before ending calls would lead to unhandled exceptions being thrown. `KJS-2416`

## 6.16.0 - 2024-10-28

### Fixed

- Fixed the cleaning of server subscription's resource for the case when websocket connection fails during a subscription attempt. `KJS-2345`

## 6.15.0 - 2024-09-27

### Added

- Added Call handling for glare error notifications from the Gateway.
  - When received, the SDK will attempt to revert the pending call negotiation to return the call to a stable state.
- Added the dispatch of `subscription:error` event for the case when user tries to subscribe/unsubscribe for/from a service without being first authenticated. `KJS-1756`

### Fixed

- Fixed a Call issue where receiving a websocket notification for an unknown call would result in an exception appearing in the logs. `KJS-2239`

## 6.14.0 - 2024-08-29

## 6.13.0 - 2024-07-26

## 6.12.0 - 2024-06-28

### Added

- New media APIs for managing local detached media. `createLocalMedia`, `getLocalMedia` and `disposeLocalMedia` are used to create
  audio, video and screen media tracks locally outside of a call. `KJS-2105`
- New call configuration parameter for faster call setup: `call.skipIceCollection`. `KJS-2205`
  - Setting to `true` will skip waiting for ICE collection and proceed with negotiation.
- New media option for passing local detached media to the following call apis: make, answer, addMedia and replaceTrack. `KJS-2106`
- Added support for `call.playAudioFile` mid-call API. `KJS-2212`
- Added the handling of a glare condition caused by a remote offer.
  - In such a case, the SDK will reply with a `491` status code, indicating to backend that remote offer could not be fulfilled, due to same operation already being initiated, locally. `KJS-2136`

### Fixed

- Fixed a Call issue where `call:operation` events indicating a negotiation has finished had the incorrect `previous.status` parameter.
- Fixed a Call issue where a new operation being started while the call is being ended could lead to vague errors. `KJS-2161`

## 6.11.0 - 2024-05-30

### Fixed

- Fixed a Subscription issue where the `config.authentication.subscription.expires` value could be set too short, causing the user to be unsubscribed after some time. `KJS-1996`
  - The minimum value for `config.authentication.subscription.expires` is `60` seconds.
- Fixed issue where an exception is thrown if the remote proxy channel is broken during a call and an operation is attempted. `KJS-2167`

## 6.10.0 - 2024-04-26

### Added

- Added more specific error messages in response to various error codes that SDK can receive from backend, as part of a Call Control Response. `KJS-2056`

### Fixed

- Fixed a Call issue where two conflicting operations could be performed on a call simultaneously in some scenarios. `KJS-1799`, `KJS-2002`
  - The second operation will now fail with error code `call:12` rather than being attempted.
- Fixed an issue where restarting media on a call was failing. `KJS-2096`
- Fixed an issue where the SDK would incorrectly store duplicate track ids when a call is taken off hold. `KJS-2019`
- Fixed a Call issue where the error for performing an operation on a non-existent call was unclear. `KJS-2097`
- Fixed a Call issue where `call:stateChange` events were not being emitted when Consultative Transfer & Join operations failed.
- Fixed a Call issue where a local call operation can fail to complete in scenarios when network delays cause replies to be received out of order. `KJS-2150`

## 6.9.0 - 2024-03-28

### Added

- Added extra validation on `sendCustomParameters` API to ensure parameters are set on the Call, before calling this API. `KJS-2047`

### Fixed

- Fixed an issue where the SDK was incorrectly reporting previous call state `Ended` when a call is ended locally. It now correctly reports previous call state as `Connected`. `KJS-2099`

### Changed

- Changed call metrics logic so that call metrics are only added into the report as part of a successful call event. This way, the metric value will only measure the duration of a successful operation. `KJS-1972`

### Added

- Added a new parameter `authAccount` to the `credentials` object that is passed in the `makeAnonymous` call API. The value for this parameter should be the account with the `callMe` service enabled and can be used to authenticate token-less calls instead of the value for `call destination`. This is an optional parameter and is only required if you intend for the `Caller` to use the subscribed account with `callMe` service enabled. `KJS-2049`

## 6.8.0 - 2024-02-23

### Added

- Added a new property to the CallObject: `call.currentOperations`. `KJS-1853`
  - This property lists all of the on-going operations, initiated either locally and remotely, for the call.
  - The `call:operation` event indicates when an operation on this property has been updated.
- Added a new parameter to the `call:operation` event: `operationId`. KJS-1853
  - This parameter is a unique ID for the operation triggering the event. It matches the ID of the operation object stored in the `call.currentOperations` property.

### Fixed

- Fixed a Call issue where multiple, unrelated call operations occurring at the same time would conflict with each other in some scenarios. `KJS-1682`, `KJS-1975`
- Fixed a Subscription issue where user subscriptions would not be automatically extended when nearing expiration. `KJS-1983`
- Fixed the API documentation for `call.getAvailableCodecs` to contain up-to-date information, as this API is currently supported in the latest Firefox browser. `KJS-1984`
- Fixed the Call documentation for the `call:statsReceived` event not indicating that the `result` parameter is present only on success. `KJS-1999`
- Fixed issue with call reports that was blocking several call establishment operations while making an anonymous call. `KJS-2000`

### Deprecated

- The previous CallObject properties for operation tracking, `call.localOp` and `call.remoteOp`, are being deprecated and will be removed in a future major release. `KJS-1853`
  - If you were using either of these call properties, please use the new `call.currentOperations` property instead.

## 6.7.1 - 2024-01-31

## 6.7.0 - 2024-01-26

### Fixed

- Added missing documentation for call config parameters. `KJS-1917`
- Fixed a Call issue where `devices:change` events were emitted when a call ended even though no device changed. `KJS-1953`
- Fixed a Call issue where two `devices:change` events were emitted when a media device was disconnected instead of only one. `KJS-1953`
- Fixed the configuration sample used in video calling for the `Anonymous Calls` tutorial trail, since video call was failing. `KJS-1957`

## 6.6.0 - 2023-12-29

### Added

- Added `REST_REQUEST` sub-event to the main operation event in the generated call report, for all the complex operations (join, direct/consultative transfer) as well as for any other miscelaneous requests that did not record such sub-event. Also added this sub-event to the `update session` main event, triggered when a Peer performs a local operation (e.g. hold, unholds, restart ice collection). `KJS-1514`

### Fixed

- Fixed a Call issue where the `call.mediaBrokerOnly` configuration was ignored when being taken off remote hold after receiving music-on-hold. `KJS-1742`
- Fixed an issue where if the ignore or reject call api's are called against a call in `Connected` state, it will change the state of the call to `Ended` even though the operation failed and the call is still actually `Connected`. `KJS-1888`
- Fixed an issue where the we weren't ending remote events in the call report that were using regular signalling flow (not slow-start), as well as checking for remote unhold operations when checking for ice collection. `KJS-1880`
- Fixed issue where anonymous calls were trying to make a call even if they failed subscription. `KJS-1903`
- Fixed the way SDK searches for data (within a given call report) by making use of an API that is supported by a wider range of Chrome browsers. `KJS-1898`
- Fixed an issue where the SDK was trying to process a midcall operation notification on a call in the incorrect state. `KJS-1857`

### Changed

- Renamed call report event names to be more consistent and clear. `KJS-1647`
  - `SET_LOCAL_DESCRIPTION` renamed to `PROCESS_MEDIA_LOCAL`
  - `SET_REMOTE_DESCRIPTION` renamed to `PROCESS_MEDIA_REMOTE`
  - `PROCESS_RESPONSE` replaced by `PROCESS_MEDIA_REMOTE`

## 6.5.1 - 2023-12-07

This is a hotfix release.

### Fixed

- Fixed an issue where we weren't including an object in the `auth:change` event. In certain cases this object contains properties relevent to the event that could if missing could break a client. `KJS-1897`
- Fixed a Call issue related to the new Call Reports feature where calls would fail on earlier versions of Chrome browsers. `KJS-1898`

## 6.5.0 - 2023-11-24

### Fixed

- Fixed two issues with `call:stateChange` event:
  - during local hold, when the event payload contained wrong 'previous' call state parameters.
  - during call hang up, when the event did not contain a reason text & status code. This applies to the peer that got notified for the call that ended. `KJS-1844`

### Other Changes

This release also includes changes to a few other parts of the SDK. These changes should not be noticeable to an application, but are worth mentioning for awareness. A number of features of the SDK have had their codebase renewed to better support the direction of the SDK going forward. This will translate to a better developer experience in the future.

The following features have been updated internally: Authentication. They do not require any application changes as part of the release, as the changes are backwards-compatible. As always, if you encounter an issue with a release change, please report the issue to us.

## 6.4.0 - 2023-10-27

### Other Changes

This release also includes changes to a few other parts of the SDK. These changes should not be noticeable to an application, but are worth mentioning for awareness. A number of features of the SDK have had their codebase renewed to better support the direction of the SDK going forward. This will translate to a better developer experience in the future.

The following features have been updated internally: Notifications, Messaging, Logs, and Configs. They do not require any application changes as part of the release, as the changes are backwards-compatible. As always, if you encounter an issue with a release change, please report the issue to us.

## 6.3.1 - 2023-10-03

### Fixed

- Fixed a Call issue where the `media:trackEnded` event was not being emitted to the application. `KJS-1776`
  - This issue was introduced in the v6.0.0 release.
- Fixed a Proxy issue where an error is encountered on SDK initialization in environments without WebRTC support. `KJS-1777`
  - This issue was introduced in the v6.0.0 release.

## 6.3.0 - 2023-09-29

### Fixed

- Fixed an issue where we were incorrectly setting the call operation to `MAKE` instead of `ANSWER` for call metrics `TIME_TO_COLLECT_ICE_CANDIDATES` and `TIME_TO_RELAY_CANDIDATES` when answering a slow start call. `KJS-1737`
- Fixed an issue with invoking `call.getAvailableCodecs` API after a call has been initiated. `KJS-1735`
- Fixed a Call issue where if the ICE collection check failed, the SDK would not emit a `call:stateChange` event after ending the call. `KJS-1767`

### Removed

- Removed a duplicate call metric (TIME_TO_MEDIA_DURATION) from the call report, since its value is already captured under the ANSWER_CALL_LOCAL_SETUP metric. `KJS-1755`

## 6.2.0 - 2023-08-31

### Fixed

- Fixed a Call issue where the list of media devices was out-of-date when a call's track ended due to device disconnection. `KJS-1520`
  - The list of devices from the `media.getDevices` API is now correct when the `media:trackEnded` event is emitted.
- Fixed a Call issue where the `call:operation` event was not always emitted for midcall operations.
- Fixed an issue with the call reports where the `event` objects in the timeline were missing the `end` property.
- Fixed the dual hold scenario where the other side of the call unholds the call second and is put into `On Hold (remote)` state when it should be in `Connected` state. `KJS-1646`

## 6.1.0 - 2023-08-01

### Added

- A new API has been added that allows for the collection of various metrics during a call.
  - These metrics include `time to media`, `ice collection duration` and `time to answer` among others.
  - Specific events during a call are also collected and included in the call report.
  - A call report can be obtained by calling the `call.getReport` API function. This will return a JSON formatted object containing all call events and computed metrics relating to that call.
  - For more information, please see the [API documentation](https://ribboncommunications.github.io/webrtc-anonymous-js-sdk/docs/#callgetreport).
  - Try the tutorial: [Get Report tutorial](https://ribboncommunications.github.io/webrtc-anonymous-js-sdk/tutorials/?config=blue#/Call%20Reports).

### Fixed

- Fixed a Call issue where a remote hold operation would not be interpreted properly in specific scenarios, causing the call not to be put On Hold. `KJS-1605`
- Fixed the dual hold scenario where the initial holder unholds the call first and is put into `Connected` state when it should be in `On Hold (remote)` state. `KJS-1554`
- Fixed a Call issue where an error when handling a remote midcall operation was not being reported to the application.

## 6.0.0 - 2023-06-30

### Removed

- Removed support for the `Plan-B` SDP Semantic for Calls. `KJS-1412`
  - Browsers only support the `Unified-Plan` SDP Semantic, and the WebRTC JS SDK is aligning with WebRTC specification.
  - The removal of the `Plan-B` configuration was announced in v4.29.0 (2021-06-25).
- The `call.defaultPeerConfig.sdpSemantics` configuration is no longer changeable from the default `Unified-Plan`.
- Removed backwards-compatibility support for deprecated authentication configurations format. `KJS-422`
  - Please see the `configs` API documentation or the `User Connect` tutorial for information about the latest format for the authentication and subscription configurations.
- Removed backwards-compatibility support for the following call configurations: `iceserver`, `iceServers`, and `sdpSemanatics`.
  - Please see the `configs` API documentation or the `Voice and Video Calls` tutorial for information about the format for the call configurations.

### Other Changes

The v6.0 release also includes changes to a few other parts of the SDK, similar to what our v5.0 release included. These changes should not be noticeable to an application, but are worth mentioning for awareness. A number of features of the SDK have had their codebase renewed to better support the direction of the SDK going forward. This will translate to a better developer experience in the future.

The following features have been updated internally: Calls. They do not require any application changes as part of v6.0, as the changes are backwards-compatible. As always, if you encounter an issue with a release change, please report the issue to us.

### Removed

- Removed the Call configuration `call.removeH264Codecs`. `KJS-839`
  - Call codecs should be removed using the `call.sdpHandlers` configuration with the `createCodecRemover` helper.
  - This is a breaking change: H264 codecs will not be removed by default any longer. Please see the Migration section below for more information.

### Migration

#### H264 Codec Removal

The `call.removeH264Codecs` configuration is being removed since it overlaps with the preferred `call.sdpHandlers` and `createCodecRemover` functionality. They perform the same behaviour but allow for more control and ability in choosing specifically which codecs should be removed.

Below is a comparison of how the H264 codecs can be removed using both methods. For more information about the `createCodecRemover`, please see the `sdpHandlers.createCodecRemover` function and `CodecSelector` type in the documentation.

_Note_: The `call.removeH264Codecs` configuration was `true` by default, meaning the SDK would remove H264 codecs unless specified not to. With the removal of `call.removeH264Codecs`, H264 codecs will not be removed unless specified to.

```javascript
// Example SDK initialization with a codec-remover for H264.
// Only available prior to v6.0 changes.
import { create } from '@rbbn/webrtc-js-sdk'
const client = create({
  call: {
    removeH264Codecs: true
  }
})

// Example SDK initialization with a codec-remover for H264.
// Available in both v5.0 and v6.0.
import { create, sdpHandlers } from '@rbbn/webrtc-js-sdk'
const codecRemover = sdpHandlers.createCodecRemover(['H264'])
const client = create({
  call: {
    sdpHandlers: [codecRemover]
  }
})

// Example codec-remover for more specific H264 codecs.
const codecRemover = sdpHandlers.createCodecRemover([
  {
    name: 'H264',
    fmtpParams: ['profile-level-id=4d0032', 'packetization-mode=1']
  }
])
```

## 5.10.0 - 2023-05-26

### Fixed

- Fixed the API documentation & Tutotial sections to use the correct event `call:tracksAdded`, instead of the obsoleted one (`call:newTrack`) `KJS-1513`

## 5.9.0 - 2023-04-28

### Fixed

- Fixed the API documentation (for `call.stopVideo`) by indicating the correct final event names that are being triggered to application. `KJS-1459`
- Fixed a Call issue where a `call:tracksRemoved` event was being emitted falsely (i.e., for a track that was not removed) after an `unhold` operation. `KJS-1454`
- Fixed the issue of re-rendering the same track (under the same CSS Selector) multiple times. `KJS-1468`

## 5.8.0 - 2023-03-31

## 5.7.0 - 2023-02-24

### Added

- Added capability to make subsequent `subscribe` requests in case the server responds with a `503 - Service Unavailable` response (e.g., when subscribing for a certain service).
  - Added a new subscription configuration parameter: `config.authentication.serviceUnavailableMaxRetries` which can be used to override the default value of subscription re-attempts (i.e. 3 re-attempts). `KJS-961`

### Removed

- Dropping support for `plan-b`: WebRTC JS SDK no longer supports Plab-B, as part of its webrtc call functionality. The plan to remove `plan-b` was previously announced in version `4.29.0` on 2021-06-25. Current support is for `unified-plan` only. `KJS-1412`
- Removal of deprecated (3.x) functionality, as follows:
  - Removed support for `auth` configuration objects: `config.authentication.subscription` & `config.authentication.websocket`
  - Removed support for `call` configuration objects: `config.call.iceserver`, `config.call.iceServers` & `config.call.sdpSemantics`
  - Removed API docs for deprecated API: `setDefaultDevices`
  - Removed support for passing a `contact` parameter (as a String) for API: `contacts.update`. Supported parameter is now an Object instance.
    `KJS-727`

## 5.6.0 - 2023-01-27

### Added

- Added a new Call feature: the `call.playAudioFile` API. `KJS-892`
  - This API allows an application to temporarily replace their local audio track with audio from a file, allowing the remote call endpoint to hear the file.
  - Please see the `call.playAudioFile` API documentation for more information.

### Changed

- As part of rebranding of Ribbon's WebRTC JS SDKs, the build filename (as well as its associated map filename) for `Kandy Anonymous Call` SDK, were changed as follows:
  - kandy.callMe.js was renamed to: webrtc.anonymous.js
  - kandy.callMe.js.map was renamed to: webrtc.anonymous.js.map
- Also, the global exported variable from this build file, has changed from `Kandy` to `WebRTC`.
  `KJS-1220`

## 5.5.0 - 2022-12-22

### Fixed

- Fixed a Call issue where the application would not be notified of a remote track added to a Call in certain scenarios. `KJS-1139`

### Changed

- Starting from Chromium 110, Chromium will perform stricter validation of STUN and TURN server urls as according to RFC spec. Please update any ice server URL configs as appropriate. `KJS-1349`
  - TURN URLs only support a `transport` parameter as part of query section, and STUN URLs do not support any query section.
  - The SDK will automatically remove incorrect query parameters on the STUN/TURN server URLs for Chrome 110+.
  - Updated the call configuration in the tutorial sections so that ICE Server URLs adhere to the RFC spec for STUN/TURN URLs, and updated the API documentation for ICE server URLs highlighting this change. `KJS-1361`

## 5.4.0 - 2022-11-25

### Fixed

- Fixed a Call issue where unrendering a track after the call ends could fail, leaving the track in the DOM. `KJS-1148`

## 5.3.0 - 2022-10-28

### Fixed

- Fixed a Call issue where where the music on hold would not be received during slow-start negotiations. `KJS-1162`

## 5.2.0 - 2022-09-30

### Fixed

- Fixed a Call issue where, when making an outgoing call, receiving the call answer then a remote midcall operation immediately afterwards would not ensure the call is established before handling the remote operation. `KJS-1152`

## 5.1.1 - 2022-08-31

### Fixed

- Fixed an issue introduced in v5.1.0 causing the SDK to fail to initialize.

## 5.1.0 - 2022-08-26

### Fixed

- Fixed a Call issue where where remote video would not be added to the call in certain backend configurations. `KJS-1052`

### Changed

- Updated the `webrtc-adapter` package. `KJS-911`
  - This affects the RTCIceCandidates that are received by the IceCollectionCheck function. The candidate's component property will now be polyfilled according to latest WebRTC spec, i.e., it will now explicitly be "rtp" or "rtcp" instead of "1" or "2".

## 5.0.0 - 2022-08-02

The v5.0 release of the Kandy JS SDK simplifies and improves how media tracks are handled for calls. It does not add any new features, but it fixes and clarifies the different scenarios around what/how tracks can be added or removed from a call. The majority of changes are internal to the SDK in how tracks are handled, but they affect how the SDK communicates with an application for this handling. The release also comes with recommendation changes on when an application should render/remove tracks to take into account the SDK changes.

As a major release, it includes a few breaking changes that application developers need to address. The 'Migration' section at the end of this release version includes information about the changes.

### Added

- Added new call events: `call:tracksAdded` and `call:tracksRemoved`
  - These events are intended to replace the previous `call:newTrack` and `call:trackEnded` events.
  - These events notify when a Call operation, either performed locally or remotely, has added or removed tracks from a call. An event will be emitted once per operation (rather than per track affected) to inform of all local and/or remote tracks affected due to the operation.
  - These events signify that a track's media is available to be rendered (`call:tracksAdded`) or the track's media is no longer available to be rendered (`call:tracksRemoved`).
  - For more information, please see the [API documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#calleventcalltracksadded) for these events.
- Added new track event: `media:trackEnded`
  - This event signifies that a track was unexpectedly ended by an action outside the control of the SDK, but is still part of a Call.
  - This scenario was previously reported as part of `call:trackEnded`, but is now separate as its significance is very different.
  - For more information, please see the [API documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#mediaeventmediatrackEnded) for this event.

### Removed

- Removed the call events: `call:newTrack` and `call:trackEnded`
  - These events are replaced by the new `call:tracksAdded` and `call:tracksRemoved` events. These new events serve the same purposes, but are different enough where re-using the same events would be deceptive.
- Removed SDK functionality that would automatically remove an ended local track from a Call.
  - This is replaced by the new `media:trackEnded` event. Please see the 'Auto-Removal on Track Lost' section of this changelog for more information.

### Changed

- Changed the significance for track events: `media:sourceMuted` and `media:sourceUnmuted`
  - These events now only signify that a track has unexpectedly lost (or regained) its media source for reasons outside the control of the SDK. Such as network issues for a remote track.
  - When a call operation causes a track to disconnect (or reconnect) from its media source, that will be handled by the new `call:tracksRemoved` and `call:tracksAdded` events instead.

### Migration

#### `call:newTrack` --> `call:tracksAdded`

The functional differences between the previous `call:newTrack` and new `call:tracksAdded` events are very minor. The only change needed to handle the difference in parameters is that `call:tracksAdded` includes the list of all events affected, rather than a single track.

The conceptual differences between the `call:newTrack` and `call:tracksAdded` events are a little more significant. The `call:tracksAdded` event signifies that tracks are now part of the Call and their media can be rendered. Previously, the `call:newTrack` event signified a track was part of the Call but not necessarily that its media was available. Applications should now consider `call:tracksAdded` to be the time when a track can be rendered.

If an application has their business logic in a `handleNewTrack` function, then the event listener for `call:newTrack` can be adapted for `call:tracksAdded` as below. For more examples of the `call:tracksAdded` event being handled, please see our 'Voice and Video Calls' and 'Handling Media Tracks' tutorials.

```javascript
// Example event listener for when a new track is added to a Call.
// Prior to v5.0 changes.
client.on('call:newTrack', function (params) {
  const track = client.media.getTrackById(params.trackId)
  // Call the application logic for how a new track should be handled.
  handleNewTrack(track, params.callId)
})

// Example event listener for when new tracks are added to a Call.
// For `call:tracksAdded`, an application should consider rendering the tracks
//    to be part of their application logic.
// Post v5.0 changes.
client.on('call:tracksAdded', function (params) {
  params.trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)
    // Call the application logic for how a new track should be handled.
    handleNewTrack(track, params.callId)
  })
})
```

#### `call:trackEnded` --> `call:tracksRemoved`

The differences between the `call:trackEnded` and `call:tracksRemoved` events are very similar as between the `call:newTrack` and `call:tracksAdded` events. The important difference to mention is a significance change: the `call:tracksRemoved` event signifies that tracks have been purposefully removed from a Call by an SDK operation. The `media:sourceMuted` and `media:trackEnded` events cover the unexpected scenarios. The tracks' media is no longer available to be rendered, and will not be available unless re-added to the Call with a `call:tracksAdded` event. Applications should not continue rendering a track after the `call:tracksRemoved` event.

If an application has their business logic in a `handleTrackGone` function, then the event listener for `call:trackEnded` can be adapted for `call:tracksRemoved` as below. For more examples of the `call:tracksRemoved` event being handled, please see our 'Voice and Video Calls' and 'Handling Media Tracks' tutorials.

```javascript
// Example event listener for when a track has ended.
// Prior to v5.0 changes.
client.on('call:trackEnded', function (params) {
  const track = client.media.getTrackById(params.trackId)
  // Call the application logic for how a track ending should be handled.
  handleTrackGone(track, params.callId)
})

// Example event listener for when tracks are removed from a Call.
// For `call:tracksRemoved`, an application should unrender the tracks as part
//    of their application logic.
// Post v5.0 changes.
client.on('call:tracksRemoved', function (params) {
  params.trackIds.forEach(trackId => {
    const track = client.media.getTrackById(trackId)
    // Call the application logic for how a removed track should be handled.
    handleTrackGone(track, params.callId)
  })
})
```

#### `media:sourceMuted` & `media:sourceUnmuted`

The `media:sourceMuted` and `media:sourceUnmuted` events have had no functional changes. The significance of the `media:sourceMuted` event has changed to be focused on the scenario when a track unexpectedly loses access to its media source, for example a remote track will temporarily become "source muted" during network issues. Previously the event could be triggered by a Call operation, which will now be handled by the `call:tracksRemoved` event in the expected scenario.

The previous Kandy recommendation was to unrender a track when it becomes "source muted", since it could have been triggered by multiple causes. Now that the event is focused on media issues, unrendering the track is not a necessity and an application developer will need to decide how they want to convey a temporary media interruption to their end-user. If the tracks are left rendered during this time, an end-user would simply see/hear the remote media be "choppy" during the issues.

For more in-depth information about this scenario, please see the 'Handling Media Tracks' tutorial.

#### Auto-Removal on Track Lost

When a track unexpectedly ended, the SDK would previously remove that track from the Call automatically. This was done to cleanup the call, so that both sides of the call knew that the track was no longer available. This was not always desired
behaviour, though, and could interfere with how an application wanted to handle this scenario. To clarify this scenario, the new `media:trackEnded` has been added to explicitly signify a track loss (rather than it being grouped with the `call:trackEnded` event).

For an application to keep the same auto-removal behaviour when updating to the v5.0 SDK, they would need to handle this event by manually removing the track from the call, as shown below. This auto-removal behaviour was removed from the SDK to allow an application more flexibility in how this scenario should be handled, though. It could be an option to replace the track instead of outright removing it, for example. For more in-depth information about this scenario, and alternate options, please see the 'Handling Media Tracks' tutorial.

```javascript
// Example event listener for the new `media:trackEnded` event, replicating the
//    previous "auto-removal" behaviour of the SDK.
// Post v5.0 changes.
client.on('media:trackEnded', function (params) {
  const { trackId, callId } = params
  const track = client.media.getTrackById(trackId)

  // Remove local tracks that end unexpectedly. This is the behaviour the SDK
  //    performed automatically prior to v5.0.
  if (track.isLocal) {
    client.call.removeMedia(callId, [trackId])
  }
})
```

### Other Changes

The v5.0 release also includes changes to a few other parts of the SDK. These changes should not be noticeable to an application, but are worth mentioning for awareness. A number of features of the SDK have had their codebase renewed to better support the direction of the SDK going forward. This will translate to a better developer experience in the future. They do not require any application changes as part of v5.0, as the changes are backwards-compatible. As always, if you encounter an issue with a release change, please report the issue to us.

## 4.41.2 - 2022-07-28

### Fixed

- Fixed a Call issue where sending in-band DTMF tones 0 and \* would not be recognized by the remote endpoint. `KJS-982`

## 4.41.1 - 2022-07-20

### Fixed

- Fixed a Call issue where a `join` operation would cause audio issues for remote users with music-on-hold in certain backend configurations. `KJS-934`

## 4.41.0 - 2022-06-30

## 4.40.0 - 2022-05-27

## 4.39.0 - 2022-04-28

### Added

- Added new function parameters to the configured ICE Collection Check function (`call.iceCollectionCheckFunction`). It will now receive the configured timeout configurations (`call.iceCollectionIdealTimeout` and `call.iceCollectionMaxTimeout`) inside an object as the second function parameter. `KJS-799`

### Fixed

- Fixed documentation for `call.replaceTrack`, `media.muteTracks` & `media.unmuteTracks` APIs to better document the interactions they have on calls and tracks. `KJS-594`
- Fixed a Call issue where the default configuration value for the ICE Collection Check function (`call.iceCollectionCheckFunction`) would not use the latest timeout values if they were updated after SDK initialization. `KJS-799`
- Fixed the error message (generated when there are websocket connection timeouts) so that is better understood by the application. `KJS-800`
- Fixed documentation for `updateConfig` to clarify the correct way to update sdp handlers after updating `removeH264Codecs`. `KJS-818`

## 4.38.0 - 2022-03-25

### Fixed

- Fixed a Call issue where removing a local track would not trigger a `call:trackEnded` event if the user had previously been receiving music-on-hold. `KJS-626`

## 4.37.1 - 2022-03-08

### Fixed

- Refixed a Call issue where an irregular remote, slow-start operation causes the Call's subsequent operations to fail. `KJS-571`
  - This issue was partially fixed in v4.37.0.

## 4.37.0 - 2022-02-25

### Added

- Added a Call config `iceCollectionCheckFunction` to allow for configuration of the ICE candidate collection process. `KJS-449`
  - This replaces the previous `iceCollectionCheck` Call config, and previous functions provided using that config will need to be updated to adhere to the form of the new IceCollectionCheckFunction definition.
  - See [IceCollectionCheckFunction documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#callicecollectioncheckfunction) for more information.

### Fixed

- Fixed a Call issue where an irregular remote, slow-start operation would cause the Call's operation tracking to become out-of-sync with actual operations. `KJS-542`

### Changed

- Changed when we start a call audit loop from Connected state to Initiated state in order to catch scenarios where the call is ended before it's connected. `KJS-445`
- Changed the default ICE Collection Check Function functionality. `KJS-450`
  - Previously, negotiation would begin as soon as an ICE candidate of type "relay" was collected.
  - The new change takes into account the number of media transports, and configured TURN servers. For more information, see [IceCollectionCheckFunction documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#callicecollectioncheckfunction).
  - Added Call config properties `iceCollectionIdealTimeout` and `iceCollectionMaxTimeout` to allow configuration of the timeouts for the default function.
- The SDK will no longer always end a call if no ICE candidates have been gathered, giving more control to the ICE collection check function. `KJS-546`
  - The default ICE collection check behaviour will still fail a call if no ICE candidates have been gathered.
  - Custom ICE collection check functions will now have to add logic for this as needed.

## 4.36.0 - 2022-01-28

### Fixed

- Fixed a Config issue where the SDK would unintentionally mutate the object provided by the application while setting configs internally. `KJS-511`
  - The `getConfig` API can be used to retrieve the configs being used by the SDK.
- Fixed a Config issue where the `updateConfig` API may revert a Call config to the default value if only a subsection was being updated. `KJS-511`
- Fixed a Call issue preventing all configuration properties of `call.defaultPeerConfig` from being used to start and answer calls. `KJS-543`
- Added new call error code `call:11` that represents a failure to answer call due to a media negotiation mismatch. `KJS-517`

## 4.35.1 - 2022-01-17

Please note that the changelog entry for v4.35.0 regarding the `defaultPeerConfig` has been clarified. It was previously missing key information about the `call.iceServers` configuration.

### Fixed

- Fixed a compatibility issue introduced in v4.35.0 where the `updateConfig` API would set Call configurations differently than when set originally during SDK initialization. `KJS-504`
- Updated configuration tutorial for call configuration to demonstrate the new `defaultPeerConfig` configuration object. `KJS-499`
- Fixed a Call issue where errors would not be reported to the application in certain scenarios when a failure occurred at the WebRTC level of a call operation. `KJS-508`

## 4.35.0 - 2021-12-21

### Added

- Added a Call config `defaultPeerConfig` to allow for a complete configuration of an RTCPeerConnection. `KJS-370`
  - `defaultPeerConfig` supports the same set of properties defined in RTCConfiguration. See [RTCConfiguration properties](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection) for details.
  - Please note that an existing configuration, `call.iceServers`, has been moved to be within `defaultPeerConfig`. The previous format is still accepted for backwards-compatibility, but we recommend updating your configuration to reflect this change. It will be deprecated and removed in the future.

### Fixed

- Fixed behaviour where a call would still connect when no ICE candidates were found. Calls that experience this will now fail instead. `KJS-329`
- Fixed a backwards compatibility issue with the `client.media.renderTracks` API. `KJS-457`
- Fixed a Call issue where unexpected tracks would appear after call operations if video was added to the call at some point. `KJS-382`, `KJS-267`

## 4.34.0 - 2021-11-26

### Added

- Added a new object property `mediaOffered` to `CallObject` (for an incoming call) to reflect what caller has offered in terms of media. `KJS-334`
- Added the ability to use the `call.replaceTrack` API on a call as long as it is on-going. `KJS-347`
  - Previously the operation required the call to be in the 'Connected' state only.

### Fixed

- Fixed an issue where the media direction wasn't being set correctly when adding video to a transceiver that we are reusing, this resulted in
  the call losing remote video when local video is added. `KJS-396`
- Fixed the issue where the websocket cleanup was not triggered when a lost connection was detected. `KJS-424`
- Fixed an issue where if no css selector is passed when calling `client.media.renderTracks` API, it would result in an exception. Now it is
  handled as an error and logged accordingly. `KJS-419`
- Fixed an issue where calls would occasionally get stuck in `Initiating` state if no user info was provided. `KJS-421`
- Fixed an issue where if the client updated the notifications config and set idCacheLength to 0 (disable duplicate checking) it wouldn't be
  used by the SDK and it would continue to check for duplicate notifications. `KJS-427`

## 4.33.0 - 2021-10-29

### Added

- Added improved handling for local network errors occurring during add media and remove media operations for calls. `KJS-184`
- Added two properties: `isLocal` & media `id` on the `media:sourceMuted` & `media:sourceUnmuted` events. These events are sent to application level. `KJS-78`
- A new `connectivity.resetConnection` API to allow for a reset of websocket connection. This can be invoked by the application when it detects unstable network conditions. `KJS-373`
- Added new `fetch` API. `kandy.fetch` allows the client to send any Kandy REST request through the SDK. `KJS-374`

### Fixed

- Fixed a Call issue where EarlyMedia could be enabled on Firefox even though it cannot support it. `KJS-366`
  - A warning will be logged on SDK initialization and the configuration will be disabled.

## 4.32.0 - 2021-09-24

### Added

- Added public documentation for `config.call.normalizeDestination`. `KJS-103`
- Added an extra property `iceCollectionDelay` as part of `extraInfo` parameter that is passed to `iceCollectionCheck` function. This will further improve the application's side in making a decision whether it has collected good enough ICE candidates. `KJS-253`
- Updated the _Generating Tokens_ tutorial to specify that SDK supports greater length keys when generating the auth tokens. `KJS-158`

### Fixed

- Update notifications plugin state when a websocket connection is removed to indicate the websocket channel is no longer enabled. `KJS-209`
- Fixed a Call issue where the start/stop video APIs were failing. `KJS-251`
- Fixed a Call issue where receiving a compressed SDP would cause the operation to fail `KJS-328`

## 4.31.0 - 2021-08-30

### Added

- Added support for additional parameters that are passed into the `config.call.iceCollectionCheck` function, in order for application to better decide when it collected good enough ICE candidates for the media call. `KJS-202`
- Added Call functionality to restart media after a connection failure. `KJS-86`, `KJS-68`
  - A new `call.mediaRestart` API has been added to trigger the restart operation. Please see its description for more information.
  - A new `call:mediaRestart` event has been added to signify the result of the operation.
- Added exception handling to the SDP handler pipeline. If any handler throws an exception, it's now logged and execution continues with the next handler in the pipeline. `KJS-46`
- Added previous media connection state to `call:mediaConnectionChange` event data. `KJS-96`
- Added improved Call handling for local network errors occurring during hold and unhold midcall operations. `KJS-127`

### Fixed

- Fixed a Call issue for slow-start operations where the call would not enter 'On Hold' state in certain scenarios. `KJS-259`
- Fixed an issue with the `updateConfig()` API where it would merge arrays instead of replace them. `KJS-205`
- Updated internal timing provided to the `call.iceCollectionCheck` configuration function to be more accurate. `KJS-123`
  - The `elapsedTime` parameter will be the actual time rather than based on the `call.iceCollectionDelay` value.

## 4.30.1 - 2021-08-11

### Fixed

- Fixed a Call issue where a call would not enter 'On Hold' state when the remote endpoint holds the call in certain scenarios. `KAA-2654`

## 4.30.0 - 2021-07-30

### Added

- Added new Call tutorial for Device Handling. `KJS-152`

### Changed

- Changed the domain names used in configuration for all turn/stun servers to the newly public ones (for Kandy's tutorials). `KJS-89`

## Fixed

- Improved YAML SDP log output by not repeating the final SDP if there has been no changes from the `logHandlers`.

## 4.29.0 - 2021-06-25

### SDP Semantics Defaults

With this release we're announcing the default SDP semantics are changing to the standard compliant `unified-plan` semantics. Only users on Chrome version `92` and earlier are impacted by this change. This is happening now that Google Chrome M91 is published and all interoperability work is finished. In subsequent releases `plan-b` support will be removed entirely. For more information see the release notes for SDK version `4.18.0`.

### Added

- Added a new property to the `CallObject` called `mediaConnectionState`, which tracks the underlying media connection state of a call. `KJS-141`, `KJS-223`
  - A new call event [`call:mediaConnectionChange`](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#calleventcallmediaconnectionchange) is also emitted every time the media connection state is changed.
- Added a new property to the call config called `callAuditTimer`, which sets the time interval to follow when auditing a call. If not specified in the call config object, the default of 25000 milliseconds will be used. `KJS-106`
- Added the ability to customize the `X-CPaaS-Agent` header's value by appending any custom string to its value. `KJS-159`

### Fixed

- Reworked Call audits so that the audits are performed with more consistency with respect to the interval. `KJS-105`
- Switched from using String.prototype.replaceAll to String.prototype.replace and using regex to do the correct string replacement. Some browsers don't yet
  support replaceAll. `KJS-82`
- Fixed a Call issue where a remote hold operation would not be processed correctly in some scenarios. `KAA-2639`

## 4.28.0 - 2021-05-28

### Added

- Added a Call configuration check to ensure the SDK is not configured to use SDP Semantic 'Plan-B' with a Chrome version that no longer supports it.
  - Please be aware that SDP Semantic 'Plan-B' is being deprecated. It is only supported on Chrome and only prior to version M93.

### Fixed

- Fixed a Call issue on Chrome where remote video tracks would not be ended when the remote participant removed them from the Call in certain scenarios. `KAA-2628`
  - This issue still exists on non-Chromium based browsers for the time being.
- Fixed a few documentation issues to clarify some information.
  - Clarified the information retrieved from the `call.getStats` API. `KAA-2281`
  - Clarified that only locally set CustomParameters are stored on a Call. Please see the `call.CustomParameter` object. `KAA-2603`

## 4.27.0 - 2021-04-30

### Added

- Improved the logging of [SDP handler functions](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#callsdphandlerfunction). `KJS-99`
  - In [`DEBUG` mode](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#loggerlevels) and lower, each SDP handler function applied to the SDP and the changes that may have resulted.
  - The final SDP is logged with all of the changes that have been applied.
  - The entire report is logged to the console in [YAML format](https://yaml.org/).

### Fixed

- Changed how [`destroy`](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#apidestroy) is used to prevent errors when destroying inside an event. `KJS-123`
- Fixed an issue where minimizing the SDK caused an error. `KJS-141`
- Added handling websocket error and close scenarios instead of waiting for the heartbeat to fail to either retry connection or just notify the app and clean up subscription. `KJS-61`
- Added missing 'Call API:' logs to call plugin api interface. `KJS-124`

## 4.26.0 - 2021-03-26

### Fixed

- Updated the Handling Media Tracks tutorial for more clarity. `KJS-109`

## 4.25.0 - 2021-02-26

### Added

- Added a new _Handling Media Tracks_ tutorial. `KJS-28`
  - Explains how to manage the medias during an ongoing call.

## 4.24.2 - 2021-02-22

This is a hotfix release, reverting some changes introduced in 4.24.0 and 4.24.1 causing regressions.

As we've become aware, some of the changes we've done in an attempt to correct the issue `KAA-2599` have caused some regressions. We've attempted to correct those issues with 4.24.1 but there are still issues being discovered. In this release we are reverting to the behavior before this change was introduced.

### Technical background on the issue

In some configurations of Kandy, the SDK doesn't receive any SSRC attributes in SDP payloads. This causes a change in behavior in the Chrome browser where `MediaStreamTrack` and `MediaStream` ids take on a value that is no longer unique. This breaks a fundamental assumption that the SDK has about media tracks and streams. In 4.24.0 we attempted what seemed to be an innocuous workaround and our results were positive. However, shortly after we started receiving reports of issues in regular call scenarios (where SSRC is present). 4.24.1 was an attempt at fixing those issues, but after it's release we started noticing new cases that were not accounted for.

Because of the core nature of the assumption of id uniqueness in the SDK we've decided to revert all the changes related to trying to cover for this case and will be addressing this more thoroughly in a future release.

### Changed

- Reverted all changes done for `KAA-2599` and `KAA-2605`.

## 4.24.1 - 2021-02-10 [YANKED]

⚠️ **Post-release note**: This version of the SDK continues to cause regressions with call audio after hold/un-hold call operations and has been yanked.

### Fixed

- Fixed a Call issue where there was no audio after an un-hold operation. `KAA-2605`

## 4.24.0 - 2021-01-29 [YANKED]

⚠️ **Post-release note**: This version of the SDK revealed a major regression issue with call audio after hold/un-hold call operations and has been yanked.

### Added

- Added explicit warning around the connectivity plugin when using `server` for the `responsibleParty` and a `pingInterval`. `KJS-58`
  - `pingInterval` is ignored when the server is responsible for pings. This has been made more explicit now.

### Changed

- Updated Logging tutorial to download logs in NDJSON format. `KJS-25`
- Updated error messages when an action is performed on an invalid call state.

### Fixed

- Fixed issue where Kandy.js would ignore a new track if it had the same id as another track on another peer. `KAA-2599`

## 4.23.0 - 2020-12-21

### Added

- Added a request authorization event: `request:error` `KAA-1076`
  - This event is specific for authorization issues when communicating with the server and notifies an application that the user's credentials should be updated/fixed. This event is emitted _in addition_ to any regular error event for an operation that may be emitted.

### Fixed

- Fixed a Call issue where a crash would occur when a remote SDP offer does not have a media-level direction attribute. `KAA-2585`
- Fixed an issue where log handlers set in the config were not being applied to WebRTC related logs.`KAA-2528`

## 4.22.0 - 2020-11-27

### Added

- Added SDK metadata to `call:statsReceived` event's payload. `KAA-2557`
- Added a new Call Statistics tutorial. `KAA-2559`
  - Explains how to retrieve statistics for calls and what the statistics can be used for.

### Fixed

- Fixed issue where call is not successfully put on hold if only one side is sharing video. `KAA-2555`
- Minor documentation fixes.
- Update the Call `MediaConstraint` format description to include the "direct value" approach. `KAA-2565`
- Fixed an issue where if an error occurred during the user connect before the call, further call attempts would not work. `KAA-2529`
- Fixed an issue where failed anonymous calls didn't delete the subscription when denied media access. `KAA-2530`
- Fixed issue where the user subscription was being removed if internet connectivity was lost for too long. `KAA-2538`

### Changed

- Changed `call.getStats` Call API to return a Promise, so that caller can get the report of the call as part of invoking this API. `KAA-2558`

## 4.21.0 - 2020-10-30

### Fixed

- Fixed a Call 4.X/3.X interop issue where a remote hold operation would be misinterpreted in some scenarios. `KAA-2463`

### Changed

- Action logs are now disabled by default. The client can provide either a boolean or an object with action log configuration details. If `logActions` is set to `true`, the default settings for action logs will be used. See [Config documentation](https://kandy-io.github.io/kandy-callMe-js-sdk/docs/#config). `KAA-2504`

## 4.20.0 - 2020-10-02

### Added

- Added a new media API `media.initializeDevices`to get the list of available media devices with permission from the users-end device. `KAA-2445`
- Improved debugging logs for network operations. `KAA-2503`
  - Added new debug level logs for REST request and response information.
  - Added new debug level logs for messages sent and received on the websocket.
  - Added new section to the Logging tutorial to better describe the log levels.
- Added the ability to name the redux store instance for debugging with redux devtools extension.

### Fixed

- Fixed documentation for `renderTracks` function to correctly use `track.trackId` instead of the incorrect `track.id`. `KAA-2502`
- Fixed a Media issue for `Unified-Plan` calls where a remote track would incorrectly be marked as muted when created. `KAA-2519`

### Changed

- Updated tutorial codepens to be more robust around authentication and subscription operations. `KAA-2491`
- Removed `Creating LogManager` debug log since it was only in place to work around a bug in Chrome that has been fixed. `KAA-2494`

## 4.19.0 - 2020-08-28

### SDP Semantics Defaults

We've decided to wait to change the default SDP Semantics to `unified-plan`. We've identified some issues in some solutions that we would like to resolve before making the change. It's still a good idea to prepare and test your application with unified plan turned on in order to be ready when the change takes place.

### Added

- Added a new Logging tutorial. `KAA-2464`
  - Explains how the SDK's logging system works and how an application can customize its behaviour.

## 4.18.0 - 2020-07-31

### Important update

With this release we're announcing the deprecation of `plan-b` SDP semantics and the intent to change the default SDP semantics to the standard compliant `unified-plan` semantics in an upcoming release.

This change has been on the horizon since the WebRTC standard committee chose `unified-plan` as the way forward. Since then, Chrome has been on a path to make this change and eventually remove `plan-b`
as a supported option.
You can read about Chrome's transition plan here:
[https://webrtc.org/getting-started/unified-plan-transition-guide](https://webrtc.org/getting-started/unified-plan-transition-guide)

Browsers other than Chrome or Chrome-based browsers are unaffected by this change since they don't support `plan-b` and have supported `unified-plan` for a while.

#### What does this mean for developers

`unified-plan` support is available today and you can start testing your application today. In order to do so you need to change the sdpSemantics option in your configuration when creating the
SDK like so:

```javascript
import { create } from '@rbbn/webrtc-anonymous-js-sdk'
const client = create({
  call: {
    sdpSemantics: 'unified-plan'
    // ...
  }
})
```

The above configuration will become the default in an upcoming release.

Additionally, in order to have the same user experience when performing mid-call operations, your application will need to make sure to handle 2 events that you may not have needed previously:

- `media:sourceMuted` - Triggered when a track is muted at the source.
- `media:sourceUnmuted` - Triggered when a track is unmuted at the source.

These events will indicate when tracks (especially video tracks) should be displayed/rendered or not.

To learn in detail how to use these events, please visit our tutorials.
Choose the configuration that applies to you:

- [Kandy-US](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=us#/Configurations)
- [Kandy-EMEA](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=emea#/Configurations)
- [Kandy-UAE](https://kandy-io.github.io/kandy-link-js-sdk/tutorials/?config=uae#/Configurations)

> Note: The tutorials above are for the non-anonymous version of the SDK but the configuration still applies.

### Added

- Added bandwidth control parameter for anonymous calls. `KAA-2403`
- Added new Call API `call.setSdpHandlers` for setting SDP Handlers after the SDK has been initialized. `KAA-2322`
- Added new tutorials. `KAA-2432`

### Fixed

- Fixed an issue preventing the playing of video tracks during a call on iOS Safari. `KAA-2382`
- Fixed erroneous validation messages being thrown by valid call configurations.
- Fixed an issue preventing the proper termination of an audio+video outgoing call when camera was already in use. `KAA-2426`
- Fixed a Call issue where a failed anonymous call start would not be reported as an error. `KAA-2440`
- Fixed issue where uncaught errors in `setLocalDescription` were crashing the saga. These events are now being properly handled. `KAA-2460`
- Fixed `media:sourceMuted` and `media:sourceUnmuted` events by adding `trackId` data instead of passing it in a single element array. `KAA-2455`

### Changed

- Updated the `webrtc-adapter` package (6.4.4 -> 7.6.3). `KAA-2381`
- Added a small note to the documentation to inform that screensharing is not supported on iOS Safari. `KAA-2429`

## 4.17.0 - 2020-06-26

### Added

- Added new parameter validation to all configs used with the `create` function. Incorrect parameters will log a `VALIDATION` message. `KAA-2223`
- Added new session level bandwidth limit parameter to the call API. The parameter is `call` and should be passed in the same options object as `audio` and `video` bandwidth controls. `KAA-2108`
- Added documentation about `CodecSelectors` for `sdpHandlers.createCodecRemover`.
- Added Call functionality for the `makeAnonymous` API to start a call with screenshare. `KAA-2424`
  - See the `callOptions.screen` and `callOptions.screenOptions` parameters in the documentation.
- Added callId parameter passed to SDP pipeline handlers `call.SdpHandlerFunction`. `KAA-2242`

### Fixed

- Fixed a Call issue where the callee would not receive a `call:newTrack` event for the remote tracks when answering the call. `KAA-2380`
- Fixed a Call issue where SDP Handlers were not given the opportunity to act on a local SDP before it was sent to the remote endpoint. `KAA-2136`
- Fixed issue where `call.states` JS doc block was not included as part of public documentation for callMe SDK. `KAA-2366`
- Fixed the custom header (sent by any request to backend & used for analytics) so that its value reflects the actual platform (or service) used by SDK. `KAA-2395`
- Fixed an issue where replacing a track and then ending it wasn't emitting the proper `call:trackEnded` event. `KAA-2370` `KAA-2387`
- Normalized error data returned from all REST requests to internal components. Doesn't impact public API. `KAA-2348`
- Fixed an issue with `sdpHandlers.createCodecRemover` where it wasn't handling multiple codecs selectors with the same name. `KAA-2416`
- Fixed a Call issue the `makeAnonymous` API would not use the `audioOptions` and `videoOptions` options when starting a call. `KAA-2424`

### Changed

- Changed `call.getAvailableCodecs` Call API to return a Promise, so that caller can get the list of codecs as part of invoking this API, without the need to setup a separate event listener. This does not impact the existing use of API. `KAA-2423`

## 4.16.0 - 2020-05-29

### Added

- Added new call config option 'mediaBrokerOnly'. When set to true the SDK will not try to recreate a calls PeerConnection. This is intended for backends configured to disallow peer to peer connections. `KAA-2259`
- Added new Call API `call.getAvailableCodecs` which can be used to return a list of available codecs supported by the browser. `KAA-2275`
- Added a configuration parameter that allows the user to choose the authentication method for the WebSocket.`KAA-2279`
- Added new Call option for configuring DSCP markings on the media traffic. `KAA-2256`
- DSCP controls can be configured with the `call.make`, `call.answer`, `call.addMedia`, and `call.startVideo` Call APIs.
- Added `removeBundling` flag to the call config for users that want to turn it off. `KAA-2338`

### Fixed

- Removed the need for remote party properties (callNotificationParams) to be present in notifications. `KAA-2271`
- Fixed Firefox calling Chrome issue related to media bundling. `KAA-2282`
- Fixed the triggering of call:trackEnded event (on caller's side) when a media track is removed as well as duplication of such event (on callee's side) when plan-b is used. `KAA-2343`
- Fixed an issue with removing media for a 'Connected' Call (after an earlier attempt was made while the Call was 'On Hold') `KAA-2353`

### Changed

- Improved the `call.startVideo` API to allow for configuring additional options such as bandwidth.
- The default for `removeBundling` has been changed to be `false`, thereby enabling media bundling. `KAA-2338`

## 4.15.0 - 2020-04-30

### Added

- Added the handling of mute/unmute events which are being generated when a media source is muted/unmuted by triggers that are outside of SDK's control. `KAA-1641`

### Fixed

- Removed the need for remote party properties (callNotificationParams) to be present in a sessionProgress notification. `KAA-2271`

### Changed

- Improved logs for Calls. `KAA-2219`
- Improved behaviour when loading SDK into browser that doesn't support WebRTC. `KAA-2238` `KAA-2258`

## 4.14.0 - 2020-03-27

### Fixed

- Fixed an issue where an existing local video track could not be replaced by a screen sharing track. `KAA-2144`

### Added

- Add Call support for receiving early media. `KAA-2099`
  - When enabled via configuration (see `config.call.earlyMedia`), an outgoing Call may enter the "Early Media" state if the remote end responds with a provisional answer. This allows the Call to receive media before it has been answered.
- Added checking for media willSend and willReceive when a Hold operation is received in case the remote side answered an audio only call with audio and video. `KAA-2209`

## 4.13.0 - 2020-02-28

### Added

- Added a destroy function to allow users to wipe the SDK state and render the SDK unusable. `KAA-2181`
  - This is useful when a user is finished with the SDK and wants their data to not be available to the next SDK consumer. After destroy is called, the SDK must be recreated for an application to continue working.
- Added a new call configuration to trigger a resync of all active calls upon connecting to the websocket. `KAA-2154`
  - The new call configuration `resyncOnConnect` is disabled by default.
  - The resync feature requires Kandy Link 4.7.1+.

### Fixed

- Fixed a Call issue where a slow-start, remote hold operation, when entering a "dual hold" state, was not being processed correctly. `KAA-2183`
- Fixed problems with Firefox Hold/Unhold under `plan-b` sdpSemantics by making it impossible to start the SDK in `plan-b` under any browser that is not Chrome. `KAA-2174`

## 4.12.0 - 2020-01-31

### Added

- Added Call support for receiving custom parameters throughout a call. `KAA-2084`
  - A `call:customParameters` event is emitted which contains the custom parameters when they are received.
  - This feature requires Kandy Link 4.7+.
- Added SDP Handler functionality to allow modifying a local SDP after it has been set locally but before sending it to the remote endpoint. `KAA-2136`
  - A `step` property has been added to the `SdpHandlerInfo` parameter given to a `SdpHandlerFunction`. This indicates whether the next step is to `set` the SDP locally or `send` the SDP to the remote endpoint.

### Fixed

- Fixed an issue where PUSH notification channel was closed by default. `KAA-719`
- Fixed a Call issue where remote hold and unhold operations would not be handled properly if the remote application is using a v3.X Kandy SDK. `KAA-2105`
- Fixed a Call issue where Call configurations for the ICE collection process were not used for incoming calls. `KAA-2184`
  - See `KAA-1469` in v4.10.0 for affected configurations.
- Fixed an SDP Handler issue where `SdpHandlerInfo.type` was undefined the first time an SDP Handler is called on receiving a call.
- Fixed the issue where there was no refresh subscription and the Call will be torn down when the subscription expires. `KAA-2145`
- Fixed a midcall issue where removal of a remote media track did not trigger an event notification to application level (when using unified-plan). `KAA-2150`
- Fixed issue with anonymous calls where the SDK throws an error if you make an anonymous call with invalid credentials. Now a more correct error will be shown. `KAA-2180`

## 4.11.1 - 2020-01-02

### Fixed

- Fixed documentation issue, introduced in 4.11.0, where portions of the documentation were missing. `KAA-2151`

## 4.11.0 - 2019-12-20

### Added

- Added new Logger functionality to allow applications to customize the format of information that the SDK logs.
  - See `config.logs.handler`, `config.logs.logActions.handler`, `logger.LogHandler`, and `logger.LogEntry`.
  - An application can now provide a `LogHandler` function to the SDK via configuration. The SDK will use this function for logging information. By default, the SDK will continue to log information to the console.

### Fixed

- Fixed a Call issue where some slow-start midcall operations (eg. transfer, unhold) would fail. `KAA-2110`
  - This fix re-introduces a previous issue fixed in v4.9.0: `KAA-1890`.
- Fixed an issue where call was failing when the user(caller) has no user@domain format. `KAA-2131`
- Fixed an issue where the user is not unsubscribing when the call ends. `KAA-2113`
- Fixed an issue where callee(s) would not get notified when caller stops screen sharing through browser control. `KAA-2093`

## 4.10.0 - 2019-11-29

### Added

- Added Call support for setting and sending custom parameters. `KAA-2063`
- Added new Call configurations to provide flexibility for the ICE collection process. `KAA-1469`
  - See `config.call` for new configs: `iceCollectionDelay`, `maxIceTimeout`, and `iceCollectionCheck`.
  - These configs should only be needed when the ICE collection process does not complete normally. This should not happen in most scenarios, but can be determined if there is a delay (of 3 seconds or the value set for `maxIceTimeout`) during call establishment.
  - These configurations allow an application to customize the ICE collection process according to their network / scenario, in order to workaround issues.

### Fixed

- Fixed public documentation hyperlinks for custom type definitions. `KAA-2011`
- Fixed a Call configuration issue where midcall operations may be slow when no ICE server configurations were provided.

## 4.9.0 - 2019-11-01

### Added

- Added Call functionality where local media tracks are deleted if they are not being used for the call. `KAA-1890`
- Added a `call:operation` event which is fired by call operations to keep track of operation progress. `KAA-1949`
- Added call related API docs to help with migration from 3.x API. `KAA-2062`
- Added the emission of an event when call state changes from Initiating to Initiated. `KAA-2080`

### Changed

- Improved Call screenshare functionality. `KAA-2000`
  - Added explicit screenshare options for APIs, separate from video options. See the `call.make`, `call.answer`, and `call.addMedia` APIs.
  - A browser extension is no longer required for screensharing on Google Chrome.
  - A Call can now be started and/or answered with screenshare.

### Fixed

- Fixed an issue where the "to" information of the call wasn't being set to where the call was actually sent. `KAA-2014`
- Fixed the inconsistent order of media events for both incoming & outgoing calls. `KAA-1757`
- Fixed an issue where the SIP number normalization was unnecessarily removing an '@' symbol. `KAA-1793`
- Fixed the issue where an active call did not hang up when the call audit failed. `KAA-2003`
- Fixed documentation to reflect the correct default value for checkConnectivity parameter. `KAA-1876`
- Fixed public doc links for call and media.

## 4.8.0 - 2019-09-27

### Fixed

- Fixed the ordering and nesting of types & namespaces in public documentation. `KAA-1880`
- Fixed an issue where local call logs were reporting a duration of 0 for all incoming calls. `KAA-1794`

### Changed

- Changed the public API documentation groupings to namespaces. `KAA-1918`

### Added

- Added `displayName` option to `makeAnonymous` call api. `KAA-1909`

## 4.7.0 - 2019-08-30

### Fixed

- Fixed an issue causing some BasicError objects to have a misleading message rather than a message about the operation that failed. `KAA-1947`
- Fixed an issue where call audits weren't being sent.`KAA-1944`

## 4.6.0 - 2019-08-01

### Added

- Initial release of 4.x callMe SDK. It supports making anonymous calls using the new 4.x call stack.

[copyright © 2024 ribbon communications operating company, inc. all rights reserved]: #
