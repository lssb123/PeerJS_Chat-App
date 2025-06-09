import React, { useEffect, useRef } from 'react';
import './AudioCall.css'; // We'll create this CSS file next

function AudioCall({
  callStatus,
  remoteUser,
  onAnswer,
  onReject,
  onHangUp,
  remoteStream,
}) {
  const remoteAudioRef = useRef(null);

  // Effect to handle the remote audio stream
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Don't render anything if there's no call activity
  if (callStatus === 'idle') {
    return null;
  }

  const getCallContent = () => {
    switch (callStatus) {
      case 'incoming':
        return (
          <>
            <p>Incoming call from <strong>{remoteUser}</strong></p>
            <div className="call-actions">
              <button onClick={onAnswer} className="answer-btn">Answer</button>
              <button onClick={onReject} className="reject-btn">Reject</button>
            </div>
          </>
        );
      case 'outgoing':
        return (
          <>
            <p>Calling <strong>{remoteUser}</strong>...</p>
            <div className="call-actions">
              <button onClick={onHangUp} className="reject-btn">Hang Up</button>
            </div>
          </>
        );
      case 'active':
        return (
          <>
            <p>On a call with <strong>{remoteUser}</strong></p>
            <div className="call-actions">
              <button onClick={onHangUp} className="reject-btn">Hang Up</button>
            </div>
            {/* The audio element for the remote stream, hidden from the user */}
            <audio ref={remoteAudioRef} autoPlay playsInline />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="call-modal">
      <div className="call-modal-content">
        {getCallContent()}
      </div>
    </div>
  );
}

export default AudioCall;