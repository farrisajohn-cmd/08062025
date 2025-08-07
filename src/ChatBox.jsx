import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const avatar = '/govies-avatar.png'; // public folder path

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await fetch('https://zero8062025.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    const botMessage = { sender: 'bot', text: data.response };
    
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 3000);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') handleSend();
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      },
    ]);
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <div className="header-left">
          <img src={avatar} alt="govies.com team" className="chatbot-avatar" />
          <span className="chatbot-name">govies.com team</span>
        </div>
        <div className="header-right">
          <button onClick={clearChat} className="chatbox-icon">⟲</button>
          <button className="chatbox-icon">✕</button>
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && (
              <img src={avatar} alt="bot" className="avatar" />
            )}
            <div className="message-text">{msg.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot">
            <img src={avatar} alt="bot" className="avatar" />
            <div className="message-text">typing...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
