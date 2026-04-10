import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../services/api';

const TaskCommentsModal = ({ isOpen, onClose, taskId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  useEffect(() => {
    if (!isOpen || !taskId) return;

    // 1. Fetch historical comments
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}/comments`);
        setComments(res.data);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };
    fetchHistory();

    // 2. Connect WebSocket
    const getSocketUrl = () => {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const backendOrigin = new URL(apiBase).origin;
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return backendOrigin.replace(/^https?:/, protocol) + '/ws';
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(getSocketUrl()),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        setConnected(true);
        // Subscribe to this task's topic
        client.subscribe(`/topic/tasks/${taskId}`, (message) => {
          const newComment = JSON.parse(message.body);
          setComments(prev => [...prev, newComment]);
        });
      },
      onStompError: (frame) => {
        setConnected(false);
        console.error('[STOMP error] Broker reported error:', frame.headers['message']);
        console.error('[STOMP error] Additional details:', frame.body);
      },
      onWebSocketError: (event) => {
        setConnected(false);
        console.error('[WebSocket error]', event);
      },
      onWebSocketClose: (event) => {
        setConnected(false);
        console.warn('[WebSocket closed]', event);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      stompClientRef.current = null;
      setConnected(false);
    };
  }, [isOpen, taskId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !connected) return;

    const attachmentUrlInput = document.getElementById('attachmentUrlInput');
    const payload = {
      text: inputText.trim(),
      userId: currentUser.id.toString(),
      attachmentUrl: attachmentUrlInput ? attachmentUrlInput.value.trim() : ''
    };
    
    if (attachmentUrlInput) attachmentUrlInput.value = '';

    stompClientRef.current.publish({
      destination: `/app/tasks/${taskId}/chat`,
      body: JSON.stringify(payload)
    });

    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Task Discussion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {connected ? 
                <span className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live</span> : 
                <span className="text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Connecting...</span>
              }
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition">
            <X size={20} />
          </button>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
          {comments.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              No comments yet. Start the discussion!
            </div>
          ) : (
            comments.map((msg, idx) => {
              const isMine = msg.user.id === currentUser.id;
              return (
                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMine 
                      ? 'bg-primary-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm'
                  }`}>
                    {!isMine && (
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
                        {msg.user.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.attachmentUrl && (
                    <div className="mt-2 text-xs">
                      <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                        <span className="truncate max-w-[200px]">{msg.attachmentUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <form onSubmit={handleSend} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900/50 dark:text-white transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || !connected}
                className="p-2 sm:px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center shadow-md dark:shadow-none"
              >
                <Send size={18} className="sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <input
              type="url"
              placeholder="Attachment URL (optional image or file link)..."
              id="attachmentUrlInput"
              className="w-full text-xs px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900/50 dark:text-white transition"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentsModal;
