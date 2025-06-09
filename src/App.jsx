import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import './App.css';
import AudioCall from './AudioCall';
import VideoCall from './VideoCall';
import { formatBytes } from './utils'; // Helper for file sizes

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
  const [callStatus, setCallStatus] = useState('idle');
  const [callType, setCallType] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for persistent objects and DOM elements
  const peerInstance = useRef(null);
  const connectionRef = useRef(null);
  const lastMessageRef = useRef(null);
  const fileInputRef = useRef(null);
  const incomingFilesRef = useRef({});

  // Effect for PeerJS initialization
  useEffect(() => {
    if (currentUser) {
      const peer = new Peer(currentUser);
      peer.on('open', (id) => console.log('My peer ID is: ' + id));
      peer.on('connection', (conn) => setupConnectionListeners(conn));
      peer.on('call', (incomingCall) => {
        const type = incomingCall.metadata.type;
        setCallType(type);
        setCallStatus('incoming');
        setCall(incomingCall);
      });
      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        alert(`Error: ${err.message}.`);
        setCurrentUser(null);
      });
      peerInstance.current = peer;
    } else {
      if (peerInstance.current) peerInstance.current.destroy();
      peerInstance.current = null;
    }
    return () => { if (peerInstance.current) peerInstance.current.destroy(); };
  }, [currentUser]);

  // Effect to scroll chat to the latest message
  useEffect(() => {
    if (lastMessageRef.current) lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // --- Data Connection (Chat & File Transfer) Logic ---

  const setupConnectionListeners = (conn) => {
    connectionRef.current = conn;
    conn.on('data', (data) => {
      // Data protocol router
      switch (data.type) {
        case 'chat':
          setMessages(prev => [...prev, { sender: conn.peer, type: 'chat', content: data.payload }]);
          break;
        case 'file-metadata':
          handleReceiveFileMetadata(data.payload, conn.peer);
          break;
        case 'file-chunk':
          handleReceiveFileChunk(data.payload);
          break;
        default:
          console.warn('Received unknown data type:', data.type);
      }
    });
    conn.on('open', () => {
      setConnection(conn);
      setChattingWith(conn.peer);
    });
    conn.on('close', () => {
      alert(`${conn.peer} has left the chat.`);
      resetChatState();
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) sendFile(file);
    event.target.value = null;
  };

  const sendFile = (file) => {
    if (!connectionRef.current || !connectionRef.current.open) {
      alert('You must be connected to a peer to send a file.');
      return;
    }
    const transferId = `${Date.now()}-${file.name}`;
    const chunkSize = 64 * 1024; // 64KB
    setMessages(prev => [...prev, { id: transferId, sender: currentUser, type: 'file', file: { name: file.name, size: file.size }, progress: 0, status: 'sending' }]);
    connectionRef.current.send({ type: 'file-metadata', payload: { id: transferId, name: file.name, size: file.size, type: file.type } });
    const reader = new FileReader();
    let offset = 0;
    reader.onload = (e) => {
      connectionRef.current.send({ type: 'file-chunk', payload: { id: transferId, chunk: e.target.result } });
      offset += e.target.result.byteLength;
      const progress = Math.round((offset / file.size) * 100);
      setMessages(prev => prev.map(msg => msg.id === transferId ? { ...msg, progress } : msg));
      if (offset < file.size) readSlice(offset);
      else setMessages(prev => prev.map(msg => msg.id === transferId ? { ...msg, status: 'sent' } : msg));
    };
    const readSlice = (o) => {
      const slice = file.slice(o, o + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  };

  const handleReceiveFileMetadata = (metadata, sender) => {
    incomingFilesRef.current[metadata.id] = { metadata, chunks: [], receivedSize: 0 };
    setMessages(prev => [...prev, { id: metadata.id, sender: sender, type: 'file', file: { name: metadata.name, size: metadata.size }, progress: 0, status: 'receiving' }]);
  };
  
  const handleReceiveFileChunk = (payload) => {
    const { id, chunk } = payload;
    const fileData = incomingFilesRef.current[id];
    if (!fileData) return;
    fileData.chunks.push(chunk);
    fileData.receivedSize += chunk.byteLength;
    const progress = Math.round((fileData.receivedSize / fileData.metadata.size) * 100);
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, progress } : msg));
    if (fileData.receivedSize === fileData.metadata.size) {
      const fileBlob = new Blob(fileData.chunks, { type: fileData.metadata.type });
      const url = URL.createObjectURL(fileBlob);
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: 'complete', url } : msg));
      delete incomingFilesRef.current[id];
    }
  };

  const sendMessage = () => {
    if (connectionRef.current && connectionRef.current.open && message) {
      const msgPayload = { type: 'chat', payload: message };
      connectionRef.current.send(msgPayload);
      setMessages(prev => [...prev, { sender: currentUser, type: 'chat', content: message }]);
      setMessage('');
    }
  };

  // --- Call Logic ---

  const getLocalMedia = async (isVideoCall) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoCall });
      setLocalStream(stream);
      return stream;
    } catch (error) { console.error('Failed to get local media', error); alert('Could not access camera/microphone.'); return null; }
  };

  const startCall = async (targetUser, type) => {
    const isVideoCall = type === 'video';
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
    const stream = await getLocalMedia(isVideoCall);
    if (stream && call) {
      call.answer(stream);
      setCallStatus('active');
      setupCallListeners(call);
    }
  };

  const endCall = () => {
    if (call) call.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setCall(null);
    setRemoteStream(null);
    setLocalStream(null);
    setCallStatus('idle');
    setCallType(null);
    setIsMuted(false);
  };
  
  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => { track.enabled = !track.enabled; });
    setIsMuted((current) => !current);
  };

  const setupCallListeners = (activeCall) => {
    activeCall.on('stream', (stream) => { setRemoteStream(stream); setCallStatus('active'); });
    activeCall.on('close', () => endCall());
    activeCall.on('error', (err) => { console.error('Call error:', err); endCall(); });
  };
  
  // --- General App Logic ---

  const handleLogin = (username) => setCurrentUser(username);
  const handleLogout = () => { endCall(); if (connectionRef.current) connectionRef.current.close(); setCurrentUser(null); resetChatState(); };
  const startChat = (targetUser) => { if (peerInstance.current) { const conn = peerInstance.current.connect(targetUser); setupConnectionListeners(conn); } };
  const resetChatState = () => { setConnection(null); connectionRef.current = null; setChattingWith(null); setMessages([]); setMessage(''); };
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  
  // --- Render Logic ---

  if (!currentUser) {
    return (
      <div className="App">
        <header className="app-header"><h1>React PeerJS Chat & Call</h1></header>
        <div className="login-container">
          <h2>Select a User to Login</h2>
          <div className="user-selection">{ALL_USERS.map(user => <button key={user} onClick={() => handleLogin(user)}>Login as {user.charAt(0).toUpperCase() + user.slice(1)}</button>)}</div>
        </div>
      </div>
    );
  }

  const renderMessageContent = (msg) => {
    switch(msg.type) {
      case 'chat':
        return msg.content;
      case 'file':
        return (
          <div className="file-message">
            <div className="file-info">
              <span className="file-name">{msg.file.name}</span>
              <span className="file-size">{formatBytes(msg.file.size)}</span>
            </div>
            {msg.status === 'receiving' || msg.status === 'sending' ? (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${msg.progress}%` }}></div>
                <span>{msg.progress}%</span>
              </div>
            ) : msg.status === 'complete' ? (
              <a href={msg.url} download={msg.file.name} className="download-link">Download</a>
            ) : (<span className="file-status">{msg.status}</span>)}
          </div>
        );
      default: return null;
    }
  };

  const renderCallUI = () => {
    if (callStatus === 'active' && callType === 'video') {
      return <VideoCall remoteStream={remoteStream} localStream={localStream} onHangUp={endCall} remoteUser={call?.peer} isMuted={isMuted} onToggleMute={toggleMute} />;
    }
    if (callStatus !== 'idle') {
      return <AudioCall callStatus={callStatus} remoteUser={call?.peer} onAnswer={answerCall} onReject={endCall} onHangUp={endCall} remoteStream={remoteStream} callType={callType} isMuted={isMuted} onToggleMute={toggleMute} />;
    }
    return null;
  };
  
  return (
    <div className="App">
      {renderCallUI()}
      <header className="app-header"><h1>React PeerJS Chat & Call</h1><div className="user-info"><span>Logged in as: <strong>{currentUser}</strong></span><button onClick={handleLogout} className="logout-btn">Logout</button></div></header>
      <div className="main-container">
        <div className="users-list-panel"><h2>Other Users</h2><ul>{ALL_USERS.filter(u => u !== currentUser).map(user => <li key={user}><span>{user}</span><div className="user-actions"><button onClick={() => startChat(user)} disabled={!!chattingWith || callStatus !== 'idle'}>Chat</button><button onClick={() => startCall(user, 'audio')} disabled={callStatus !== 'idle'} className="audio-call-btn">Audio</button><button onClick={() => startCall(user, 'video')} disabled={callStatus !== 'idle'} className="video-call-btn">Video</button></div></li>)}</ul></div>
        <div className="chat-panel">
          {chattingWith ? (
            <div className="chat-container">
              <h2>Chatting with {chattingWith}</h2>
              <div className="messages-list">{messages.map((msg, index) => <div key={msg.id || index} className={`message ${msg.sender === currentUser ? 'me' : 'them'}`}><span className="sender-label">{msg.sender === currentUser ? 'You' : msg.sender}</span>{renderMessageContent(msg)}</div>)}<div ref={lastMessageRef} /></div>
              <div className="message-input-container">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current.click()} className="attach-btn" title="Send file">📎</button>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." rows="1" />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          ) : (<div className="placeholder-text"><p>Select a user to start chatting or calling.</p></div>)}
        </div>
      </div>
    </div>
  );
}

export default App;