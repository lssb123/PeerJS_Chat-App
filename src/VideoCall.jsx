import React, { useEffect, useRef } from 'react';
import './VideoCall.css';

function VideoCall({
  remoteStream,
  localStream,
  onHangUp,
  remoteUser,
  isMuted,       // new prop
  onToggleMute,  // new prop
}) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="video-call-container">
      <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
      <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />

      <div className="call-controls">
        <p>In a video call with <strong>{remoteUser}</strong></p>
        <div className="button-group">
          {/* --- NEW MUTE BUTTON --- */}
          <button onClick={onToggleMute} className="control-btn">
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={onHangUp} className="hangup-btn">
            Hang Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCall;