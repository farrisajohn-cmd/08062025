import React, { useState } from 'react';
import './ChatBox.css';
import avatar from '../public/govies-avatar.png';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hi there! how can i assist you with your FHA loan today? if you’re looking to get a quote, just let me know the estimated purchase price of the home you’re interested in. 😊",
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const botMessage = {
        sender: 'assistant',
        text: data.response,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-container">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender}`}>
          {msg.sender === 'assistant' && (
            <img src={avatar} alt="govies.com team" className="avatar" />
          )}
          <div>
            {msg.sender === 'assistant' && (
              <div className="sender-name">govies.com team</div>
            )}
            <div className="message-bubble">{msg.text}</div>
          </div>
        </div>
      ))}

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>send</button>
      </div>
    </div>
  );
};

export default ChatBox;
