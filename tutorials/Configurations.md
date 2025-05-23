[COPYRIGHT © 2024 RIBBON COMMUNICATIONS OPERATING COMPANY, INC. ALL RIGHTS RESERVED]: #

# Configurations

The first step for any application is to initialize the SDK. When doing this, you can customize certain features by providing a configuration object. The configuration object is separated by feature and is provided to the SDK Factory as seen in the example below.

### Anonymous Call

The Anonymous Call configs are used to initialize call/network settings and they are no different from the regular Call settings. This can customize how the library interacts with the network or provide the library with resources for low-level network operations.

```javascript
call: {
  defaultPeerConfig: {
    // A key-value dictionary that corresponds to the available RTCPeerConfiguration which is normally
    // passed when creating an RTCPeerConnection.
    // See https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection#parameters RTCPeerConnection's
    // configuration parameters} for more information.
    // Specify the TURN/STUN servers that should be used.
    // Note that starting with Chromium 110, TURN(S) urls must only contain a transport
    // parameter in the query section and STUN urls must not specify any query section.
    iceServers: [
      { urls: 'turns:turn-blue.rbbn.com:443?transport=tcp' },
      { urls: 'stun:turn-blue.rbbn.com:3478' }
    ]
  },
  // Other feature configs.
  ...
}
```

In most cases, the default values will suffice for an application, but specifying your own configurations allows you to customize certain behaviours.

This quickstart will showcase a few samples of why you may want to use certain configurations. For a full list of the possible configurations, see the Configuration Documentation.

## Example Configurations

### Authentication

The Authentication configs are used to specify the backend service that the SDK should connect to. The value(s) provided are the host for the WebRTC Gateway that the application is targeting.
Also if the WebRTC Gateway is deployed on the premises, it will be up to the user to define the host.
Note: It is important to always include these configurations.

```javascript
authentication: {
  subscription: {
    server: 'webrtc-blue.rbbn.com'
  },
  websocket: {
    server: 'webrtc-blue.rbbn.com'
  }
}
```

### Logs

The Logs configs are used to change the SDK's internal logging behaviour. The SDK will generate logs that provide information about what it is doing, such as info and debug messages, warnings, and errors. These configurations allow an application to select which levels they would like to see logs for, and how those logs should be handled.

By default, the SDK will include logs for all levels (the default `logLevel` is 'debug') and will print the logs to the browser's console (via the default `handler` function) at their appropriate level (for example, 'info' logs will use `console.info` and 'debug' logs will use `console.debug`).

These defaults work well for development purposes, but may conflict with browser or other behaviours. For example, since the default Log Handler uses the browser's console, the browser may also filter logs based on its own settings. Many browsers do not show the 'debug' level by default, so it would be an extra step for a user to enable those logs in their browser. A custom Log Handler can be used to avoid this behaviour conflict, by always using the same level for the browser's console. For this reason, it is recommended that all applications actively set the `logLevel` and `handler` configurations for logs, to ensure the SDK's logging behaviour is well suited for your application and its users.

```javascript
logs: {
  // Set the log level to 'debug' to output more detailed logs.
  logLevel: 'debug',
  // Provide a custom Log Handler function.
  handler: function yourLogHandler (logEntry) { ... }
}
```

### Connectivity

The Connectivity configs are used to customize the behaviour of the websocket and connectivity checks. These settings should only be needed if the default configs are not sufficient, and you want to tweak the behaviour for your application's scenario.

```javascript
connectivity: {
  // Specify that a keepAlive ping should be sent every 60 seconds,
  // and if unable to connect should try to reconnect 3 times before
  // throwing an error. Specify to wait 10 seconds before attempting
  // to connect, and double that time every connection attempt, while
  // keeping maximum wait time under 300 seconds.
  pingInterval: 60000, // milliseconds
  reconnectLimit: 3,
  reconnectDelay: 10000, // milliseconds
  reconnectTimeMultiplier: 2,
  reconnectTimeLimit: 300000, // milliseconds
  autoReconnect: true,
  checkConnectivity: true
}
```

[COPYRIGHT © 2024 RIBBON COMMUNICATIONS OPERATING COMPANY, INC. ALL RIGHTS RESERVED]: #

