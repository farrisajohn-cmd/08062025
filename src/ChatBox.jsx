import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const reply = data.response || "sorry, something went wrong.";
      setMessages([...newMessages, { sender: 'assistant', text: reply }]);
    } catch {
      setMessages([...newMessages, { sender: 'assistant', text: 'error contacting server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const clearMessages = () => {
    setMessages([
      {
        sender: 'assistant',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      },
    ]);
  };

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <div className="chatbox-header-left">
              <img src="/govies-avatar.png" alt="avatar" className="chat-avatar" />
              <span className="chatbox-title">govies.com team</span>
            </div>
            <div className="chatbox-header-buttons">
              <button onClick={clearMessages}>⟲</button>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === 'assistant' ? 'assistant' : 'user'}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="chat-message assistant">typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="chatbox-closed" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}
    </div>
  );
};

export default ChatBox;
