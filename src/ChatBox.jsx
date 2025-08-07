import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';
import avatar from '../public/govies-avatar.png';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const assistantMessage = { sender: 'assistant', text: data.response };
      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 3000); // min 3 sec delay
    } catch (err) {
      console.error('Error:', err);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: 'hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!',
      },
    ]);
    setInput('');
  };

  if (!isOpen) return (
    <button className="chat-toggle" onClick={() => setIsOpen(true)}>💬</button>
  );

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <img src={avatar} alt="avatar" className="avatar" />
        <span className="chat-title">govies.com team</span>
        <button className="chat-btn" onClick={clearChat}>⟲</button>
        <button className="chat-btn" onClick={() => setIsOpen(false)}>✕</button>
      </div>
      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            {msg.sender === 'assistant' && (
              <img src={avatar} alt="avatar" className="avatar" />
            )}
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message assistant">
            <img src={avatar} alt="avatar" className="avatar" />
            <div className="chat-bubble typing">typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your question..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
