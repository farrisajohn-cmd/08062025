import React, { useState } from 'react';
import './ChatBox.css';

const avatar = process.env.PUBLIC_URL + '/govies-avatar.png';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hi there! how can i assist you with your FHA loan today? if you're looking to get a quote, just let me know the estimated purchase price of the home you're interested in. 🏡",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
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
      const botMessage = { sender: 'assistant', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'sorry, there was an error. please try again shortly.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-row ${msg.sender === 'user' ? 'user' : 'assistant'}`}
          >
            {msg.sender === 'assistant' && (
              <img src={avatar} alt="govies avatar" className="avatar" />
            )}
            <div className={`message-bubble ${msg.sender}`}>
              {msg.sender === 'assistant' && (
                <div className="sender-name">govies.com team</div>
              )}
              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-row assistant">
            <img src={avatar} alt="govies avatar" className="avatar" />
            <div className="message-bubble assistant">
              <div className="sender-name">govies.com team</div>
              <div className="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>send</button>
      </div>
    </div>
  );
};

export default ChatBox;
