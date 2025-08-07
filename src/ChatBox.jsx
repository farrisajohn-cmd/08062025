import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await fetch('https://zero8062025.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      setIsTyping(false);
    }, 3000); // always wait 3 seconds minimum
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <img src="/govies-avatar.png" alt="govies.com team" className="chatbox-avatar" />
        <span className="chatbox-title">govies.com team</span>
        <div className="chatbox-buttons">
          <button onClick={() => window.location.reload()}>⟲</button>
          <button onClick={() => document.querySelector('.chatbox-container').style.display = 'none'}>✕</button>
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chatbox-message ${msg.sender}`}>
            {msg.sender === 'bot' && <img src="/govies-avatar.png" className="chatbox-avatar-small" alt="bot" />}
            <div className="chatbox-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chatbox-message bot">
            <img src="/govies-avatar.png" className="chatbox-avatar-small" alt="bot" />
            <div className="chatbox-bubble typing">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chatbox-input-area">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
