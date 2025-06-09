import React, { useEffect, useRef } from 'react';
import './AudioCall.css';

function AudioCall({
  callStatus,
  remoteUser,
  onAnswer,
  onReject,
  onHangUp,
  remoteStream,
  callType,
  isMuted,       // new prop
  onToggleMute,  // new prop
}) {
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getCallContent = () => {
    switch (callStatus) {
      case 'incoming':
        return (
          <>
            <p>Incoming {callType} call from <strong>{remoteUser}</strong></p>
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
        // Only show this UI for active AUDIO calls
        if (callType === 'audio') {
            return (
              <>
                <p>On a call with <strong>{remoteUser}</strong></p>
                <div className="call-actions">
                  {/* --- NEW MUTE BUTTON --- */}
                  <button onClick={onToggleMute} className="bg-primary hover:bg-primary/90">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button onClick={onHangUp} className="reject-btn">Hang Up</button>
                </div>
                {/* Hidden audio element for the remote stream */}
                <audio ref={remoteAudioRef} autoPlay playsInline />
              </>
            );
        }
        return null; // Don't show this modal for active video calls
      default:
        return null;
    }
  };

  const content = getCallContent();
  if (!content) return null;

  return (
    <div className="call-modal">
      <div className="call-modal-content">
        {content}
      </div>
    </div>
  );
}

export default AudioCall;