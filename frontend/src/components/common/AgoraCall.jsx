import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  transition: 'all 0.15s ease',
});

/**
 * Universal Video & Voice Call Overlay.
 *
 * Dynamically switches functions and UI depending on callType ('voice' vs 'video'):
 *  - When Voice Call (Phone icon clicked):
 *      Only captures audio, hides camera PIP, and only shows Mute and End Call buttons.
 *  - When Video Call (Video Camera icon clicked):
 *      Captures camera + mic, displays PIP, and shows Mute, Camera toggle, Screen share, and Hang up.
 */
const AgoraCall = ({
  conversationId,
  targetUserId,
  myId,
  isInitiator = false,
  socket,
  callType = 'video', // 'video' | 'voice'
  remoteName = 'User',
  remoteAvatar = null,
  durationText = '00:00',
  onHangUp
}) => {
  const isVoiceOnly = callType === 'voice';

  // Agora refs
  const agoraClientRef = useRef(null);
  const agoraMicRef = useRef(null);
  const agoraCamRef = useRef(null);

  // Native WebRTC & MediaStream refs
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnRef = useRef(null);

  // Audio and Video element DOM refs
  const remoteAudioElRef = useRef(null);
  const localVideoElRef = useRef(null);
  const remoteVideoElRef = useRef(null);
  const screenVideoElRef = useRef(null);

  // States
  const [status, setStatus] = useState('connected');
  const [mode, setMode] = useState('webrtc');
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(isVoiceOnly);
  const [hasCamera, setHasCamera] = useState(!isVoiceOnly);
  const [sharing, setSharing] = useState(false);

  // Real-Time Audio Activity States
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false);
  const [audioBlockedByAutoplay, setAudioBlockedByAutoplay] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const localAudioContextRef = useRef(null);
  const remoteAudioContextRef = useRef(null);
  const localAnimFrameRef = useRef(null);
  const remoteAnimFrameRef = useRef(null);
  const localSpeakingTimerRef = useRef(null);
  const remoteSpeakingTimerRef = useRef(null);
  const localSpeakingStateRef = useRef(false);
  const remoteSpeakingStateRef = useRef(false);

  useEffect(() => {
    setCameraOff(isVoiceOnly);
    setHasCamera(!isVoiceOnly);
  }, [isVoiceOnly]);

  // Audio Visualizer & Destination Speaker Player
  const setupAudioVisualizer = (mediaStream, isLocal = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      if (isLocal) {
        localAudioContextRef.current = ctx;
      } else {
        remoteAudioContextRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        if (!isLocal) setAudioBlockedByAutoplay(true);
        ctx.resume().then(() => {
          if (!isLocal) setAudioBlockedByAutoplay(false);
        }).catch(() => {});
      }

      const source = ctx.createMediaStreamSource(mediaStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      // Route remote audio directly to speakers with clean amplification boost
      if (!isLocal) {
        try {
          const gainNode = ctx.createGain();
          gainNode.gain.value = 1.6;
          analyser.connect(gainNode);
          gainNode.connect(ctx.destination);
          console.log('🔊 Connected remote stream to Web Audio destination with gain boost');
        } catch (e) {}
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const level = Math.min(100, Math.round((avg / 128) * 100));

        if (isLocal) {
          const speakingNow = level > 12;
          if (speakingNow) {
            if (!localSpeakingStateRef.current) {
              localSpeakingStateRef.current = true;
              setIsLocalSpeaking(true);
            }
            if (localSpeakingTimerRef.current) {
              clearTimeout(localSpeakingTimerRef.current);
            }
            localSpeakingTimerRef.current = setTimeout(() => {
              localSpeakingStateRef.current = false;
              setIsLocalSpeaking(false);
            }, 600);
          }
          localAnimFrameRef.current = requestAnimationFrame(checkLevel);
        } else {
          const speakingNow = level > 10;
          if (speakingNow) {
            if (!remoteSpeakingStateRef.current) {
              remoteSpeakingStateRef.current = true;
              setIsRemoteSpeaking(true);
            }
            if (remoteSpeakingTimerRef.current) {
              clearTimeout(remoteSpeakingTimerRef.current);
            }
            remoteSpeakingTimerRef.current = setTimeout(() => {
              remoteSpeakingStateRef.current = false;
              setIsRemoteSpeaking(false);
            }, 700);
          }
          remoteAnimFrameRef.current = requestAnimationFrame(checkLevel);
        }
      };

      if (isLocal) {
        localAnimFrameRef.current = requestAnimationFrame(checkLevel);
      } else {
        remoteAnimFrameRef.current = requestAnimationFrame(checkLevel);
      }

      return {
        stop: () => {
          if (isLocal) {
            if (localAnimFrameRef.current) cancelAnimationFrame(localAnimFrameRef.current);
            if (localSpeakingTimerRef.current) clearTimeout(localSpeakingTimerRef.current);
          } else {
            if (remoteAnimFrameRef.current) cancelAnimationFrame(remoteAnimFrameRef.current);
            if (remoteSpeakingTimerRef.current) clearTimeout(remoteSpeakingTimerRef.current);
          }
          try {
            if (ctx.state !== 'closed') ctx.close().catch(() => {});
          } catch (e) {}
        }
      };
    } catch (err) {
      console.warn('Visualizer setup error:', err);
      return null;
    }
  };

  // ── 1. Acquire Appropriate Media Tracks ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const setupMedia = async () => {
      try {
        let stream = null;

        const audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        };

        if (isVoiceOnly) {
          // Voice call: only capture microphone
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
          } catch (micErr) {
            console.warn('Microphone unavailable for voice call:', micErr);
            setMuted(true);
          }
          setHasCamera(false);
          setCameraOff(true);
        } else {
          // Video call: capture camera + microphone
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: audioConstraints
            });
            setHasCamera(true);
            setCameraOff(false);
          } catch (camErr) {
            console.warn('Camera unavailable, falling back to audio:', camErr);
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
              setHasCamera(false);
              setCameraOff(true);
              toast('Camera not detected — connected with microphone', { icon: '🎙️' });
            } catch (micErr) {
              console.warn('Microphone also unavailable:', micErr);
              setHasCamera(false);
              setCameraOff(true);
              setMuted(true);
            }
          }
        }

        if (cancelled) {
          stream?.getTracks().forEach(t => t.stop());
          return;
        }

        // Ensure all audio tracks are active
        if (stream) {
          stream.getAudioTracks().forEach(t => { t.enabled = true; });
        }

        localStreamRef.current = stream;

        // Start local audio level visualizer
        setupAudioVisualizer(stream, true);

        // Attach local camera to PIP preview if in video mode
        if (!isVoiceOnly && stream && localVideoElRef.current) {
          localVideoElRef.current.srcObject = stream;
        }

        // Try Agora if active cloud credentials exist; otherwise run on Native WebRTC
        tryInitAgora(stream);

        // Setup Socket.io P2P WebRTC signaling
        setupWebRTCSignaling(stream);

      } catch (err) {
        console.error('Media setup error:', err);
      }
    };

    // ── 2. Agora RTC Engine ──
    const tryInitAgora = async (localMediaStream) => {
      try {
        const { data } = await api.get(`/calls/token/${conversationId}`);
        const { appId, channel, uid, token } = data?.data || {};

        if (!appId || appId === '8a61421f108d4b31a8b981f211eb5a7c' || appId === 'your_agora_app_id') {
          console.log(`[Call] Using Native WebRTC Engine for ${callType} call.`);
          setMode('webrtc');
          setStatus('connected');
          return;
        }

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        agoraClientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
            if (!isVoiceOnly && mediaType === 'video' && remoteVideoElRef.current) {
              user.videoTrack?.play(remoteVideoElRef.current);
              setRemoteHasVideo(true);
            }
            if (mediaType === 'audio') user.audioTrack?.play();
            setStatus('connected');
          } catch (e) {
            console.error('Agora subscribe error:', e);
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') setRemoteHasVideo(false);
        });

        await client.join(appId, channel, token || null, uid);
        setMode('agora');
        setStatus('connected');

        try {
          if (isVoiceOnly) {
            const mic = await AgoraRTC.createMicrophoneAudioTrack();
            agoraMicRef.current = mic;
            await client.publish([mic]);
          } else {
            const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
            agoraMicRef.current = mic;
            agoraCamRef.current = cam;
            await client.publish([mic, cam].filter(Boolean));
          }
        } catch (agoraTrackErr) {
          console.warn('Agora track publish warning, using native stream:', agoraTrackErr);
        }

      } catch (agoraErr) {
        console.log(`[Call] Operating in Native WebRTC Engine for ${callType} call.`);
        setMode('webrtc');
        setStatus('connected');
      }
    };

    // ── 3. WebRTC P2P Signaling via Socket ──
    const setupWebRTCSignaling = (stream) => {
      if (!socket || !targetUserId) return;

      const targetIdStr = (targetUserId?._id || targetUserId)?.toString();
      const myIdStr = (myId?._id || myId)?.toString();

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun.relay.metered.ca:80' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });
      peerConnRef.current = pc;

      // Add local audio and video tracks
      if (stream) {
        stream.getTracks().forEach(track => {
          try {
            pc.addTrack(track, stream);
          } catch (trackAddErr) {
            console.warn('Track add error:', trackAddErr);
          }
        });
      }

      // Helper to route and play remote audio reliably
      const playRemoteAudio = (remoteStream) => {
        if (remoteAudioElRef.current) {
          if (remoteAudioElRef.current.srcObject !== remoteStream) {
            remoteAudioElRef.current.srcObject = remoteStream;
          }
          remoteAudioElRef.current.muted = false;
          remoteAudioElRef.current.defaultMuted = false;
          remoteAudioElRef.current.volume = 1.0;
          remoteAudioElRef.current.play().catch(playErr => {
            console.log('Audio autoplay resume pending user interaction:', playErr);
          });
        }
      };

      pc.ontrack = (event) => {
        console.log('🔊 WebRTC received remote track:', event.track.kind, event.streams);
        let remoteStream = event.streams && event.streams[0];
        if (!remoteStream) {
          remoteStream = new MediaStream([event.track]);
        }

        // Always route to remote audio element AND Web Audio destination
        playRemoteAudio(remoteStream);
        setupAudioVisualizer(remoteStream, false);

        // If in video call, also route to video element
        if (!isVoiceOnly && remoteVideoElRef.current) {
          if (remoteVideoElRef.current.srcObject !== remoteStream) {
            remoteVideoElRef.current.srcObject = remoteStream;
          }
          if (event.track.kind === 'video') {
            setRemoteHasVideo(true);
          }
        }

        setStatus('connected');
      };

      // Determine polite peer deterministically:
      // Lexicographical comparison between myId and targetId guarantees zero offer collision
      const isPolite = myIdStr && targetIdStr ? (myIdStr > targetIdStr) : !isInitiator;

      let makingOffer = false;
      let ignoreOffer = false;
      const iceCandidatesQueue = [];

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtcSignal', {
            conversationId,
            targetUserId: targetIdStr,
            signal: { type: 'candidate', candidate: event.candidate }
          });
        }
      };

      const processIceQueue = async () => {
        while (iceCandidatesQueue.length > 0) {
          const cand = iceCandidatesQueue.shift();
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (iceErr) {
            console.warn('Queued ICE candidate error:', iceErr);
          }
        }
      };

      const initiateOffer = async () => {
        try {
          makingOffer = true;
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: !isVoiceOnly
          });
          await pc.setLocalDescription(offer);
          socket.emit('webrtcSignal', {
            conversationId,
            targetUserId: targetIdStr,
            signal: { type: 'offer', sdp: offer }
          });
        } catch (offerErr) {
          console.warn('[WebRTC] initial offer error:', offerErr);
        } finally {
          makingOffer = false;
        }
      };

      const handleSignal = async ({ senderId, signal }) => {
        if (!pc || !signal) return;
        const senderStr = senderId?.toString();
        // Ignore signals originating from self or wrong user
        if (senderStr && myIdStr && senderStr === myIdStr) return;
        if (senderStr && targetIdStr && senderStr !== targetIdStr) return;

        try {
          if (signal.type === 'ready') {
            console.log('[WebRTC] Received peer ready signal, triggering negotiation');
            if (isInitiator || !isPolite || pc.signalingState === 'stable') {
              initiateOffer();
            }
          } else if (signal.type === 'offer') {
            const offerCollision = (pc.signalingState !== 'stable') || makingOffer;
            ignoreOffer = !isPolite && offerCollision;
            if (ignoreOffer) {
              console.log('[WebRTC] Impolite peer ignoring colliding offer');
              return;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            await processIceQueue();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('webrtcSignal', {
              conversationId,
              targetUserId: targetIdStr,
              signal: { type: 'answer', sdp: answer }
            });
          } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            await processIceQueue();
          } else if (signal.type === 'candidate' && signal.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } else {
              iceCandidatesQueue.push(signal.candidate);
            }
          }
        } catch (signalErr) {
          console.warn('[WebRTC] Signal handling error:', signalErr);
        }
      };

      socket.on('webrtcSignal', handleSignal);

      // Send initial ready ping so waiting peer knows we are online
      socket.emit('webrtcSignal', {
        conversationId,
        targetUserId: targetIdStr,
        signal: { type: 'ready' }
      });

      // Offer creation by initiator or impolite peer
      if (isInitiator || !isPolite) {
        initiateOffer();
      }

      // Retry ping every 2s until WebRTC enters connected state
      const retryPing = setInterval(() => {
        if (pc && pc.connectionState !== 'connected' && pc.iceConnectionState !== 'connected') {
          console.log('[WebRTC] Sending ready handshake ping...');
          socket.emit('webrtcSignal', {
            conversationId,
            targetUserId: targetIdStr,
            signal: { type: 'ready' }
          });
        } else {
          clearInterval(retryPing);
        }
      }, 2000);

      return () => {
        clearInterval(retryPing);
        socket.off('webrtcSignal', handleSignal);
      };
    };

    setupMedia();

    return () => {
      cancelled = true;

      if (localSpeakingTimerRef.current) clearTimeout(localSpeakingTimerRef.current);
      if (remoteSpeakingTimerRef.current) clearTimeout(remoteSpeakingTimerRef.current);
      if (localAnimFrameRef.current) cancelAnimationFrame(localAnimFrameRef.current);
      if (remoteAnimFrameRef.current) cancelAnimationFrame(remoteAnimFrameRef.current);

      try {
        if (localAudioContextRef.current && localAudioContextRef.current.state !== 'closed') {
          localAudioContextRef.current.close().catch(() => {});
        }
      } catch (e) {}

      try {
        if (remoteAudioContextRef.current && remoteAudioContextRef.current.state !== 'closed') {
          remoteAudioContextRef.current.close().catch(() => {});
        }
      } catch (e) {}

      // Stop local audio/video media
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());

      // Stop Agora
      if (agoraMicRef.current) {
        try { agoraMicRef.current.stop(); agoraMicRef.current.close(); } catch (e) {}
      }
      if (agoraCamRef.current) {
        try { agoraCamRef.current.stop(); agoraCamRef.current.close(); } catch (e) {}
      }
      if (agoraClientRef.current) {
        try { agoraClientRef.current.leave(); } catch (e) {}
      }

      // Close WebRTC
      if (peerConnRef.current) {
        try { peerConnRef.current.close(); } catch (e) {}
      }
    };
  }, [conversationId, targetUserId, socket, isVoiceOnly, callType]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const unlockAudio = useCallback(() => {
    try {
      if (remoteAudioContextRef.current && remoteAudioContextRef.current.state === 'suspended') {
        remoteAudioContextRef.current.resume().catch(() => {});
      }
    } catch (e) {}

    try {
      if (remoteAudioElRef.current) {
        remoteAudioElRef.current.muted = false;
        remoteAudioElRef.current.defaultMuted = false;
        remoteAudioElRef.current.volume = 1.0;
        remoteAudioElRef.current.play().catch(() => {});
      }
    } catch (e) {}

    setAudioBlockedByAutoplay(false);
  }, []);

  const toggleMic = () => {
    unlockAudio();
    const nextMuted = !muted;
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !nextMuted;
      });
    }
    if (agoraMicRef.current) {
      agoraMicRef.current.setEnabled(!nextMuted).catch(() => {});
    }
    setMuted(nextMuted);
    toast(nextMuted ? 'Microphone muted 🔇' : 'Microphone unmuted 🎙️');
  };

  const toggleSpeaker = () => {
    unlockAudio();
    const next = !speakerMuted;
    if (remoteAudioElRef.current) {
      remoteAudioElRef.current.muted = next;
      if (!next) {
        remoteAudioElRef.current.volume = 1.0;
        remoteAudioElRef.current.play().catch(() => {});
      }
    }
    setSpeakerMuted(next);
    toast(next ? 'Speaker muted 🔇' : 'Speaker audio active 🔊');
  };

  const toggleCamera = () => {
    if (isVoiceOnly) return;
    if (!hasCamera) {
      toast('No camera detected on this device', { icon: '⚠️' });
      return;
    }
    const nextCameraOff = !cameraOff;
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !nextCameraOff;
      });
    }
    if (agoraCamRef.current) {
      agoraCamRef.current.setEnabled(!nextCameraOff).catch(() => {});
    }
    setCameraOff(nextCameraOff);
    toast(nextCameraOff ? 'Camera turned off 🚫' : 'Camera turned on 📹');
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setSharing(false);
    toast('Screen sharing stopped');
  };

  const startScreenShare = async () => {
    if (isVoiceOnly) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;

      if (screenVideoElRef.current) {
        screenVideoElRef.current.srcObject = screenStream;
      }

      if (peerConnRef.current) {
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && screenTrack) {
          sender.replaceTrack(screenTrack);
        }
      }

      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      setSharing(true);
      toast.success('Screen sharing active 💻');
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err);
        toast.error('Could not start screen sharing');
      }
    }
  };

  const toggleScreenShare = () => {
    if (sharing) stopScreenShare();
    else startScreenShare();
  };

  const handleHangUp = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    if (agoraClientRef.current) {
      try { agoraClientRef.current.leave(); } catch (e) {}
    }
    if (peerConnRef.current) {
      try { peerConnRef.current.close(); } catch (e) {}
    }
    onHangUp();
  };

  const statusText = `Connected • ${durationText}`;

  // Resume audio playback if initial browser autoplay policy was engaged
  useEffect(() => {
    const triggerAudio = () => {
      if (remoteAudioElRef.current && remoteAudioElRef.current.srcObject) {
        remoteAudioElRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', triggerAudio);
    window.addEventListener('touchstart', triggerAudio);
    return () => {
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
    };
  }, []);

  return (
    <div 
      onClick={unlockAudio}
      onTouchStart={unlockAudio}
      style={{ position: 'fixed', inset: 0, background: '#0a0f1d', zIndex: 1000, display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── Header ── */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: isVoiceOnly ? '#059669' : '#2563eb',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            {isVoiceOnly ? '📞 VOICE CALL' : '📹 VIDEO CALL'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Session with {remoteName}</div>
          <span style={{ fontSize: 11, background: '#064e3b', color: '#34d399', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
            Active
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{statusText}</span>
        </div>
      </div>

      {/* ── Main Viewport ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', padding: 24, position: 'relative', background: '#0f172a' }}>
        <div style={{ width: '100%', height: '100%', background: '#1e293b', borderRadius: 16, border: '2px solid #334155', position: 'relative', overflow: 'hidden' }}>
          
          {/* VIDEO CALL MODE: Main Video Displays */}
          {!isVoiceOnly && (
            <>
              {/* Remote Video Stream */}
              <video
                ref={remoteVideoElRef}
                autoPlay
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: remoteHasVideo ? 'block' : 'none'
                }}
              />

              {/* Screen Share Track */}
              {sharing && (
                <video
                  ref={screenVideoElRef}
                  autoPlay
                  playsInline
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#090d16',
                    zIndex: 5
                  }}
                />
              )}

              {/* Video Fallback Avatar when camera off and not sharing */}
              {(!remoteHasVideo && !sharing) && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1e293b', textAlign: 'center', padding: 24 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{
                      position: 'absolute',
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      border: '2px dashed #3b82f6',
                      animation: 'spin 12s linear infinite',
                      opacity: 0.6
                    }} />
                    {remoteAvatar || (
                      <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#3b82f6', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 700 }}>
                        {remoteName?.slice(0, 2)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{remoteName}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>
                    {remoteName}'s camera is off • {statusText}
                  </div>
                </div>
              )}

              {/* Video Call: Local PIP corner preview */}
              <div style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                width: 170,
                height: 115,
                background: '#090d16',
                border: '2px solid #2563eb',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0,0,0,0.6)',
                zIndex: 10
              }}>
                <video
                  ref={localVideoElRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: (cameraOff || !hasCamera) ? 'none' : 'block'
                  }}
                />
                {(cameraOff || !hasCamera) && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090d16', fontSize: 11.5, color: '#94a3b8', gap: 4 }}>
                    <span style={{ fontSize: 20 }}>🚫</span>
                    <span>{hasCamera ? 'Camera off' : 'No camera'}</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 10, fontWeight: 700, color: '#e2e8f0', textShadow: '0 1px 3px #000' }}>
                  {sharing ? 'You (sharing)' : 'You'}
                </div>
              </div>
            </>
          )}

          {/* VOICE CALL MODE: Focused Audio Call Display (NO video, NO PIP) */}
          {isVoiceOnly && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e3a5f 0%, #0f172a 70%)', textAlign: 'center', padding: 24 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                {/* Concentric Audio Pulse Rings — Steady and Smooth */}
                <div style={{
                  position: 'absolute',
                  width: 175,
                  height: 175,
                  borderRadius: '50%',
                  background: isRemoteSpeaking ? 'rgba(16, 185, 129, 0.32)' : 'rgba(5, 150, 105, 0.15)',
                  transform: isRemoteSpeaking ? 'scale(1.12)' : 'scale(1)',
                  transition: 'transform 0.4s ease, background 0.4s ease',
                  animation: isRemoteSpeaking ? 'speakingPulse 1.8s ease-in-out infinite' : 'pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  width: 145,
                  height: 145,
                  borderRadius: '50%',
                  background: isRemoteSpeaking ? 'rgba(16, 185, 129, 0.42)' : 'rgba(5, 150, 105, 0.25)',
                  transform: isRemoteSpeaking ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.4s ease, background 0.4s ease',
                  animation: isRemoteSpeaking ? 'speakingPulse 1.8s ease-in-out infinite' : 'pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: '0.4s'
                }} />
                {remoteAvatar || (
                  <div style={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: isRemoteSpeaking ? '#10b981' : '#059669',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 36,
                    fontWeight: 700,
                    zIndex: 2,
                    boxShadow: isRemoteSpeaking ? '0 0 30px rgba(16, 185, 129, 0.65)' : '0 10px 25px rgba(5, 150, 105, 0.4)',
                    transition: 'background 0.35s ease, box-shadow 0.35s ease'
                  }}>
                    {remoteName?.slice(0, 2)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>{remoteName}</div>
              
              <div style={{ fontSize: 14, color: isRemoteSpeaking ? '#34d399' : '#6ee7b7', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 22, transition: 'color 0.3s ease' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isRemoteSpeaking ? '#34d399' : '#10b981', boxShadow: isRemoteSpeaking ? '0 0 8px #34d399' : 'none', transition: 'all 0.3s ease' }} />
                <span>{isRemoteSpeaking ? `🔊 ${remoteName} is speaking...` : `Voice Session Connected • ${durationText}`}</span>
              </div>

              {/* ── Dynamic Real-Time Voice Activity Pills — Rock-Steady Fixed Dimensions ── */}
              <div style={{ marginTop: 22, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                {/* Remote Audio Pill */}
                <div style={{
                  width: 195,
                  height: 38,
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: isRemoteSpeaking ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: isRemoteSpeaking ? '#34d399' : '#94a3b8',
                  border: isRemoteSpeaking ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxSizing: 'border-box',
                  transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease'
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isRemoteSpeaking ? '#34d399' : '#10b981',
                    boxShadow: isRemoteSpeaking ? '0 0 8px #34d399' : 'none',
                    transition: 'all 0.3s ease'
                  }} />
                  <span>{isRemoteSpeaking ? 'Remote Speaking' : 'Remote Connected'}</span>
                </div>

                {/* Local Mic Pill */}
                <div style={{
                  width: 195,
                  height: 38,
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: muted
                    ? 'rgba(239,68,68,0.18)'
                    : (isLocalSpeaking ? 'rgba(16,185,129,0.22)' : 'rgba(16,185,129,0.1)'),
                  color: muted ? '#fca5a5' : '#86efac',
                  border: muted
                    ? '1px solid #ef4444'
                    : (isLocalSpeaking ? '1px solid #10b981' : '1px solid rgba(16,185,129,0.25)'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxSizing: 'border-box',
                  transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease'
                }}>
                  {muted ? (
                    <>
                      <span>🔇</span>
                      <span>Your Mic is Muted</span>
                    </>
                  ) : isLocalSpeaking ? (
                    <>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981'
                      }} />
                      <span>Speaking</span>
                      <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                        <span className="eq-bar eq-bar-1" />
                        <span className="eq-bar eq-bar-2" />
                        <span className="eq-bar eq-bar-3" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      <span>Your Mic is Live</span>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden In-Viewport Audio Element (zero visual clutter) */}
              <audio
                ref={remoteAudioElRef}
                autoPlay
                playsInline
                controls={false}
                style={{ position: 'absolute', bottom: 0, left: 0, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── Contextual Controls Bar ── */}
      <div style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: 22, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        
        {/* VOICE CALL CONTROLS: Mute, Speaker, and End Call */}
        {isVoiceOnly ? (
          <>
            <button
              type="button"
              onClick={toggleMic}
              style={{ ...btn(muted ? '#ef4444' : '#1e293b'), padding: '14px 28px', fontSize: 14 }}
              title={muted ? 'Unmute microphone' : 'Mute microphone'}
            >
              <span>{muted ? '🎤 Unmute' : '🎙️ Mute'}</span>
            </button>

            <button
              type="button"
              onClick={toggleSpeaker}
              style={{ ...btn(speakerMuted ? '#ef4444' : '#1e293b'), padding: '14px 28px', fontSize: 14 }}
              title={speakerMuted ? 'Turn on speaker' : 'Mute speaker'}
            >
              <span>{speakerMuted ? '🔇 Speaker Off' : '🔊 Speaker On'}</span>
            </button>

            <button
              type="button"
              onClick={handleHangUp}
              style={{ ...btn('#dc2626'), padding: '14px 32px', fontSize: 14, boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)' }}
              title="End Voice Call"
            >
              <span>🛑 End Call</span>
            </button>
          </>
        ) : (
          /* VIDEO CALL CONTROLS: Mute, Camera toggle, Screen share, and Hang up */
          <>
            <button
              type="button"
              onClick={toggleMic}
              style={btn(muted ? '#ef4444' : '#1e293b')}
              title={muted ? 'Unmute microphone' : 'Mute microphone'}
            >
              <span>{muted ? '🎤 Unmute' : '🎙️ Mute'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              style={btn(cameraOff ? '#ef4444' : '#1e293b')}
              title={cameraOff ? 'Turn on camera' : 'Turn off camera'}
            >
              <span>{cameraOff ? '📹 Start Video' : '🚫 Stop Video'}</span>
            </button>

            <button
              type="button"
              onClick={toggleScreenShare}
              style={btn(sharing ? '#10b981' : '#1e293b')}
              title={sharing ? 'Stop screen sharing' : 'Share your screen'}
            >
              <span>💻 {sharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>

            <button
              type="button"
              onClick={handleHangUp}
              style={{ ...btn('#dc2626'), padding: '12px 26px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}
              title="End Video Call"
            >
              <span>🛑 Hang Up</span>
            </button>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.12); opacity: 0.25; }
          100% { transform: scale(0.96); opacity: 0.7; }
        }
        @keyframes speakingPulse {
          0% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.1); opacity: 0.25; }
          100% { transform: scale(1); opacity: 0.65; }
        }
        @keyframes eqBar1 {
          0%, 100% { height: 3px; }
          50% { height: 11px; }
        }
        @keyframes eqBar2 {
          0%, 100% { height: 10px; }
          50% { height: 4px; }
        }
        @keyframes eqBar3 {
          0%, 100% { height: 5px; }
          50% { height: 12px; }
        }
        .eq-bar {
          width: 2.5px;
          background-color: #34d399;
          border-radius: 1px;
          display: inline-block;
        }
        .eq-bar-1 { animation: eqBar1 0.7s ease-in-out infinite; }
        .eq-bar-2 { animation: eqBar2 0.55s ease-in-out infinite; }
        .eq-bar-3 { animation: eqBar3 0.75s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AgoraCall;