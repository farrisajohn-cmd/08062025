import React, { useEffect, useRef, useState } from 'react';
import './ChatBox.css';
import avatar from '../public/govies-avatar.png';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const delay = Math.max(3000, data.text.length * 15);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.text }]);
        setIsTyping(false);
      }, delay);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "sorry, something went wrong." },
      ]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleChat = () => setIsOpen(!isOpen);
  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      },
    ]);
    setInput('');
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-box">
          <div className="chat-header">
            <div className="header-left">
              <img src={avatar} alt="govies avatar" className="chat-avatar" />
              <span className="chat-title">govies.com team</span>
            </div>
            <div className="header-right">
              <button onClick={clearChat}>⟲</button>
              <button onClick={toggleChat}>✕</button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing-indicator">typing...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={toggleChat}>
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBox;
