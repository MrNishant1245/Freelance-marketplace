const { RtcTokenBuilder, RtcRole } = require('agora-token');

try {
  const appId = '8a61421f108d4b31a8b981f211eb5a7c';
  const appCertificate = '';
  const channelName = 'test-room';
  const uid = 0;
  const role = RtcRole.PUBLISHER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;

  console.log('RtcTokenBuilder available:', typeof RtcTokenBuilder);
  if (appCertificate) {
    const token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs);
    console.log('Generated token:', token);
  } else {
    console.log('App Certificate is empty (Testing mode enabled). AppId:', appId);
  }
} catch (err) {
  console.error('Error:', err);
}
