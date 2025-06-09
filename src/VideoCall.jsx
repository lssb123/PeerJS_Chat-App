import React, { useEffect, useRef } from 'react';
import './VideoCall.css'; // We'll create this CSS file

function VideoCall({ remoteStream, localStream, onHangUp, remoteUser }) {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  // Attach the remote stream to the video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Attach the local stream to the video element (muted)
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="video-call-container">
      {/* Remote video takes up the background */}
      <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

      {/* Local video is in a small box in the corner */}
      <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />

      <div className="call-controls">
        <p>In a video call with <strong>{remoteUser}</strong></p>
        <button onClick={onHangUp} className="hangup-btn">
          Hang Up
        </button>
      </div>
    </div>
  );
}

export default VideoCall;