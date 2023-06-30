# Known Limitations

## Firefox Provisional Answer Support

Firefox does not have support for accepting provisional answers (RTCSessionDescription type of "pranswer") as part of WebRTC negotiation. Reference: https://bugzilla.mozilla.org/show_bug.cgi?id=1004510

This results in our SDK not being able to support 'Early Media' for calls on the Firefox browser. The SDK will automatically disable the Early Media feature for Firefox if the application-provided SDK configuration (specifically, `config.call.earlyMedia`) attempts to enable it.

The effect this will have on a call is that, for an outgoing call using Firefox where the remote endpoint attempts to provide Early Media before the call is established, the call will remain Ringing and will not receive any media.

This limitation will be resolved once Firefox adds support for provisional answers.

## Browser Interoperability with Cisco UCM

For environments that include a Cisco UCM component as part of their network, there are known issues with establishing calls between different browsers due to issues with WebRTC negotiation.

This results in our inability to support calls between different browsers when a Cisco UCM is part of the call flow. Though the effects may vary, a call between different browsers (for example, from Chrome to Firefox) will fail when it is answered.
