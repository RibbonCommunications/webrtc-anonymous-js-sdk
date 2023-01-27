// TODO: Update SUBSCRIPTIONFQDN & RIBBONTURN* when changes are also covered by backend
// ICE server urls to be used for Anonymous Call.
export const configs = [
  {
    name: 'blue',
    data: {
      RIBBONTURN1: 'turns:turn-blue.rbbn.com:443?transport=tcp',
      SUBSCRIPTIONFQDN: 'webrtc-blue.rbbn.com',
      RIBBON: 'Ribbon WebRTC'
    }
  }
]
