// TODO: Update SUBSCRIPTIONFQDN & RIBBONTURN* when changes are also covered by backend
// ICE server urls to be used for Anonymous Call.
export const configs = [
  {
    name: 'us',
    data: {
      RIBBONTURN1: 'turns:turn-sr1.kandy.io:443?transport=tcp',
      RIBBONSTUN1: 'stun:turn-sr1.kandy.io:3478',
      RIBBONTURN2: 'turns:turn-sr2.kandy.io:443?transport=tcp',
      RIBBONSTUN2: 'stun:turn-sr2.kandy.io:3478',
      SUBSCRIPTIONFQDN: 'sr1.kandy.io',
      RIBBON: 'Ribbon WebRTC'
    }
  }
]
