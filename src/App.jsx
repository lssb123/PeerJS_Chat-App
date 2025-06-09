import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './App.css';
import AudioCall from './AudioCall'; // Component for call notifications and audio-only calls
import VideoCall from './VideoCall'; // Component for active video calls

// Pre-defined list of users. In a real app, this would come from a database.
const ALL_USERS = ['john', 'kate'];

function App() {
  // User and Chat States
  const [currentUser, setCurrentUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [chattingWith, setChattingWith] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  // Call States
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'outgoing', 'incoming', 'active'
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  // Refs for persistent objects
  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Effect for PeerJS initialization and event handling
  useEffect(() => {
    if (currentUser) {
      const peer = new Peer(currentUser);

      peer.on('open', (id) => console.log('My peer ID is: ' + id));
      
      peer.on('connection', (conn) => {
        console.log('Incoming data connection!');
        setupConnectionListeners(conn);
      });

      peer.on('call', (incomingCall) => {
        console.log('Incoming call from', incomingCall.peer);
        const type = incomingCall.metadata.type;
        setCallType(type);
        setCallStatus('incoming');
        setCall(incomingCall);
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        alert(`Error: ${err.message}. Another user might be logged in as "${currentUser}".`);
        setCurrentUser(null);
      });

      peerInstance.current = peer;
    } else {
      if (peerInstance.current) {
        peerInstance.current.destroy();
        peerInstance.current = null;
      }
    }

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, [currentUser]);

  // Effect to scroll chat to the latest message
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // --- Call Handling Logic ---

  const getLocalMedia = async (isVideoCall) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get local media', error);
      alert('Could not access your camera/microphone. Please check permissions.');
      return null;
    }
  };

  const startCall = async (targetUser, type) => {
    const isVideoCall = type === 'video';
    console.log(`Starting ${type} call to ${targetUser}`);
    
    const stream = await getLocalMedia(isVideoCall);
    if (stream && peerInstance.current) {
      const options = { metadata: { type } };
      const outgoingCall = peerInstance.current.call(targetUser, stream, options);
      
      setCallType(type);
      setCallStatus('outgoing');
      setCall(outgoingCall);
      setupCallListeners(outgoingCall);
    }
  };
  
  const answerCall = async () => {
    const isVideoCall = callType === 'video';
    console.log(`Answering ${callType} call...`);

    const stream = await getLocalMedia(isVideoCall);
    if (stream && call) {
      call.answer(stream);
      setCallStatus('active');
      setupCallListeners(call);
    }
  };

  const endCall = () => {
    console.log('Ending call...');
    if (call) {
      call.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setCall(null);
    setRemoteStream(null);
    setLocalStream(null);
    setCallStatus('idle');
    setCallType(null);
  };

  const setupCallListeners = (activeCall) => {
    activeCall.on('stream', (stream) => {
      console.log('Received remote stream');
      setRemoteStream(stream);
      setCallStatus('active');
    });

    activeCall.on('close', () => {
      console.log('Call has been closed');
      endCall();
    });

    activeCall.on('error', (err) => {
      console.error('Call error:', err);
      endCall();
    });
  };

  // --- Chat and User Management Logic ---

  const setupConnectionListeners = (conn) => {
    conn.on('data', (data) => {
      setMessages(prev => [...prev, { sender: conn.peer, content: data }]);
    });
    conn.on('open', () => {
      setConnection(conn);
      connectionRef.current = conn;
      setChattingWith(conn.peer);
    });
    conn.on('close', () => {
      alert(`${conn.peer} has left the chat.`);
      resetChatState();
    });
  };

  const handleLogin = (username) => setCurrentUser(username);

  const handleLogout = () => {
    endCall(); // Ensure any active call is terminated on logout
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    setCurrentUser(null);
    resetChatState();
  };

  const startChat = (targetUser) => {
    if (peerInstance.current) {
      const conn = peerInstance.current.connect(targetUser);
      setupConnectionListeners(conn);
    }
  };

  const sendMessage = () => {
    if (connectionRef.current && connectionRef.current.open && message) {
      connectionRef.current.send(message);
      setMessages(prev => [...prev, { sender: currentUser, content: message }]);
      setMessage('');
    }
  };

  const resetChatState = () => {
    setConnection(null);
    connectionRef.current = null;
    setChattingWith(null);
    setMessages([]);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // --- Render Logic ---

  if (!currentUser) {
    return (
      <div className="App">
        <header className="app-header"><h1>React PeerJS Chat & Call</h1></header>
        <div className="login-container">
          <h2>Select a User to Login</h2>
          <div className="user-selection">
            {ALL_USERS.map(user => (
              <button key={user} onClick={() => handleLogin(user)}>
                Login as {user.charAt(0).toUpperCase() + user.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderCallUI = () => {
    if (callStatus === 'active' && callType === 'video') {
      return (
        <VideoCall 
          remoteStream={remoteStream}
          localStream={localStream}
          onHangUp={endCall}
          remoteUser={call?.peer}
        />
      );
    }
    
    if (callStatus !== 'idle') {
      return (
        <AudioCall
          callStatus={callStatus}
          remoteUser={call?.peer}
          onAnswer={answerCall}
          onReject={endCall}
          onHangUp={endCall}
          remoteStream={remoteStream}
          callType={callType}
        />
      );
    }
    return null;
  };
  
  return (
    <div className="App">
      {renderCallUI()}

      <header className="app-header">
        <h1>React PeerJS Chat & Call</h1>
        <div className="user-info">
          <span>Logged in as: <strong>{currentUser}</strong></span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="main-container">
        <div className="users-list-panel">
          <h2>Other Users</h2>
          <ul>
            {ALL_USERS.filter(u => u !== currentUser).map(user => (
              <li key={user}>
                <span>{user}</span>
                <div className="user-actions">
                  <button onClick={() => startChat(user)} disabled={!!chattingWith || callStatus !== 'idle'}>
                    Chat
                  </button>
                  <button onClick={() => startCall(user, 'audio')} disabled={callStatus !== 'idle'} className="audio-call-btn">
                    Audio
                  </button>
                  <button onClick={() => startCall(user, 'video')} disabled={callStatus !== 'idle'} className="video-call-btn">
                    Video
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chat-panel">
          {chattingWith ? (
            <div className="chat-container">
              <h2>Chatting with {chattingWith}</h2>
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.sender === currentUser ? 'me' : 'them'}`}
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                  >
                    <span className="sender-label">{msg.sender === currentUser ? 'You' : msg.sender}</span>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="message-input-container">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="3"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          ) : (
            <div className="placeholder-text">
                <p>Select a user from the list to start chatting or calling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;