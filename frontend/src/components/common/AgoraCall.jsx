import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import toast from 'react-hot-toast';
import api from '../../api';

AgoraRTC.setLogLevel(2); // warnings + errors only

const btn = (bg) => ({
  background: bg,
  border: 'none',
  borderRadius: 8,
  padding: '12px 20px',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

/**
 * Real Agora video call overlay.
 *
 * Props:
 *  - conversationId : string  (channel is derived on the backend)
 *  - remoteName     : string  (shown in header / waiting text)
 *  - remoteAvatar   : node    (shown when remote camera is off)
 *  - durationText   : string  (e.g. "02:15")
 *  - onHangUp       : fn      (called when user clicks Hang Up)
 */
const AgoraCall = ({ conversationId, remoteName = 'User', remoteAvatar = null, durationText = '00:00', onHangUp }) => {
  const clientRef = useRef(null);
  const micRef = useRef(null);
  const camRef = useRef(null);
  const screenRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const [status, setStatus] = useState('connecting'); // connecting | waiting | connected | error
  const [errorMsg, setErrorMsg] = useState('');
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [sharing, setSharing] = useState(false);

  // ── Join channel ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-joined', () => setStatus('connected'));

    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          user.videoTrack.play(remoteVideoRef.current);
          setRemoteHasVideo(true);
        }
        if (mediaType === 'audio') user.audioTrack.play();
        setStatus('connected');
      } catch (e) {
        console.error('Agora subscribe failed:', e);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') setRemoteHasVideo(false);
    });

    // remote user turned camera on/off (setEnabled) without unpublishing
    client.on('user-info-updated', (uid, msg) => {
      if (msg === 'mute-video') setRemoteHasVideo(false);
      if (msg === 'unmute-video') setRemoteHasVideo(true);
    });

    client.on('user-left', () => {
      setRemoteHasVideo(false);
      setStatus('waiting');
    });

    const start = async () => {
      try {
        const { data } = await api.get(`/calls/token/${conversationId}`);
        const { appId, channel, uid, token } = data.data;
        if (cancelled) return;

        await client.join(appId, channel, token || null, uid);
        if (cancelled) {
          await client.leave();
          return;
        }

        let mic = null;
        let cam = null;
        try {
          [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (err) {
          // camera missing/denied -> try audio only
          mic = await AgoraRTC.createMicrophoneAudioTrack();
          setHasCamera(false);
          setCameraOff(true);
          toast('Camera not available — joining with audio only', { icon: '🎙️' });
        }

        if (cancelled) {
          mic?.close();
          cam?.close();
          await client.leave();
          return;
        }

        micRef.current = mic;
        camRef.current = cam;
        if (cam && localVideoRef.current) cam.play(localVideoRef.current);

        await client.publish([mic, cam].filter(Boolean));
        setStatus((prev) => (prev === 'connected' ? prev : 'waiting'));
      } catch (err) {
        console.error('Agora join failed:', err);
        if (cancelled) return;
        setStatus('error');
        const code = err?.code || '';
        if (code === 'PERMISSION_DENIED' || code === 'NOT_READABLE') {
          setErrorMsg('Microphone/camera permission denied. Allow access in the browser and try again.');
        } else {
          setErrorMsg(err?.response?.data?.message || err?.message || 'Could not start the call.');
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      [micRef, camRef, screenRef].forEach((r) => {
        try {
          r.current?.stop();
          r.current?.close();
        } catch (e) { /* ignore */ }
        r.current = null;
      });
      client.removeAllListeners();
      client.leave().catch(() => {});
    };
  }, [conversationId]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const toggleMic = async () => {
    if (!micRef.current) return;
    const next = !muted;
    await micRef.current.setEnabled(!next);
    setMuted(next);
  };

  const toggleCamera = async () => {
    if (!camRef.current || sharing) return;
    const next = !cameraOff;
    await camRef.current.setEnabled(!next);
    setCameraOff(next);
  };

  const stopScreenShare = async () => {
    const client = clientRef.current;
    const screen = screenRef.current;
    if (!client || !screen) return;
    try { await client.unpublish(screen); } catch (e) { /* ignore */ }
    try { screen.stop(); screen.close(); } catch (e) { /* ignore */ }
    screenRef.current = null;
    setSharing(false);
    if (camRef.current) {
      try {
        await client.publish(camRef.current);
        camRef.current.play(localVideoRef.current);
      } catch (e) { console.error(e); }
    }
  };

  const startScreenShare = async () => {
    const client = clientRef.current;
    if (!client) return;
    try {
      const result = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'disable');
      const screenTrack = Array.isArray(result) ? result[0] : result;
      if (camRef.current) await client.unpublish(camRef.current);
      await client.publish(screenTrack);
      screenRef.current = screenTrack;
      screenTrack.play(localVideoRef.current);
      screenTrack.on('track-ended', stopScreenShare); // user clicked browser "Stop sharing"
      setSharing(true);
    } catch (e) {
      if (e?.code !== 'PERMISSION_DENIED') {
        console.error(e);
        toast.error('Could not start screen sharing');
      }
    }
  };

  const toggleScreenShare = () => (sharing ? stopScreenShare() : startScreenShare());

  // ── UI ──────────────────────────────────────────────────────────────────────
  const statusText =
    status === 'connecting' ? 'Connecting...'
    : status === 'waiting' ? `Waiting for ${remoteName} to join...`
    : status === 'error' ? 'Connection failed'
    : `Connected • ${durationText}`;

  const dotColor = status === 'connected' ? '#10b981' : status === 'error' ? '#ef4444' : '#f59e0b';

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0f1d', zIndex: 1000, display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#2563eb', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>VIDEO CALL</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Session with {remoteName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{statusText}</span>
        </div>
      </div>

      {/* Video area */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', padding: 24, position: 'relative', background: '#0f172a' }}>
        <div style={{ width: '100%', height: '100%', background: '#1e293b', borderRadius: 16, border: '2px solid #334155', position: 'relative', overflow: 'hidden' }}>
          {/* Remote video (always mounted so Agora can attach to it) */}
          <div ref={remoteVideoRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Placeholder when no remote video */}
          {!remoteHasVideo && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1e293b', textAlign: 'center', padding: 24 }}>
              {status === 'error' ? (
                <>
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: '#fca5a5', maxWidth: 420 }}>{errorMsg}</div>
                </>
              ) : (
                <>
                  {remoteAvatar}
                  <div style={{ marginTop: 16, fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>
                    {status === 'connected' ? `${remoteName}'s camera is off` : statusText}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Local preview (PIP) */}
          <div style={{ position: 'absolute', bottom: 20, right: 20, width: 160, height: 110, background: '#090d16', border: '2px solid #2563eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 15px rgba(0,0,0,0.5)' }}>
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
            {(cameraOff && !sharing) && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', fontSize: 11, color: '#94a3b8' }}>
                {hasCamera ? 'Camera off' : 'No camera'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 9, color: '#e2e8f0', textShadow: '0 1px 2px #000' }}>
              {sharing ? 'You (screen)' : 'You'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: 24, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={toggleMic} disabled={status === 'error'} style={btn(muted ? '#ef4444' : '#1e293b')}>
          <span>{muted ? '🎤 Unmute' : '🎙️ Mute'}</span>
        </button>

        <button onClick={toggleCamera} disabled={!hasCamera || sharing || status === 'error'} style={{ ...btn(cameraOff ? '#ef4444' : '#1e293b'), opacity: !hasCamera ? 0.5 : 1 }}>
          <span>{cameraOff ? '📹 Start Video' : '🚫 Stop Video'}</span>
        </button>

        <button onClick={toggleScreenShare} disabled={status === 'error'} style={btn(sharing ? '#10b981' : '#1e293b')}>
          <span>💻 {sharing ? 'Stop Sharing' : 'Share Screen'}</span>
        </button>

        <button onClick={onHangUp} style={{ ...btn('#dc2626'), padding: '12px 24px' }}>
          <span>🛑 Hang Up</span>
        </button>
      </div>
    </div>
  );
};

export default AgoraCall;
