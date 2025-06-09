import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './App.css';
import AudioCall from './AudioCall'; // Import the new component

const ALL_USERS = ['john', 'kate'];

function App() {
  // Existing States
  const [currentUser, setCurrentUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [chattingWith, setChattingWith] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  // New States for Audio Call
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'outgoing', 'incoming', 'active'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const lastMessageRef = useRef(null);

  // --- EXISTING EFFECTS (with minor additions) ---

  useEffect(() => {
    if (currentUser) {
      const peer = new Peer(currentUser, {
        host: '172.17.15.206',
        port: 9000,
        path: '/',
      });

      peer.on('open', (id) => console.log('My peer ID is: ' + id));

      peer.on('connection', (conn) => {
        console.log('Incoming data connection!');
        setupConnectionListeners(conn);
      });

      // *** NEW: Listen for incoming calls ***
      peer.on('call', (incomingCall) => {
        console.log('Incoming call from', incomingCall.peer);
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

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // --- NEW CALL HANDLING FUNCTIONS ---

  const getLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get local media', error);
      return null;
    }
  };

  const startCall = async (targetUser) => {
    console.log(`Starting call to ${targetUser}`);
    const stream = await getLocalMedia();
    if (stream && peerInstance.current) {
      const outgoingCall = peerInstance.current.call(targetUser, stream);
      setCallStatus('outgoing');
      setCall(outgoingCall);
      setupCallListeners(outgoingCall);
    }
  };
  
  const answerCall = async () => {
    console.log('Answering call...');
    const stream = await getLocalMedia();
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

  // --- EXISTING FUNCTIONS ---

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
    endCall(); // End any active call on logout
    if (connectionRef.current) connectionRef.current.close();
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

  return (
    <div className="App">
      {/* *** NEW: Render the AudioCall component *** */}
      <AudioCall
        callStatus={callStatus}
        remoteUser={call?.peer}
        onAnswer={answerCall}
        onReject={endCall} // Rejecting is the same as hanging up
        onHangUp={endCall}
        remoteStream={remoteStream}
      />

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
                  <button onClick={() => startChat(user)} disabled={!!chattingWith}>
                    Chat
                  </button>
                  {/* *** NEW: Call button *** */}
                  <button onClick={() => startCall(user)} disabled={callStatus !== 'idle'} className="call-btn">
                    Call
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chat-panel">
          {/* ... existing chat UI ... */}
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