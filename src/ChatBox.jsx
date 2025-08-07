import React, { useState } from 'react';
import './ChatBox.css'; // make sure to create this file (next step)

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const assistantMessage = { sender: 'assistant', text: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: '⚠️ something went wrong. try again!'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={i} className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
              {!isUser && (
                <img
                  src="/govies-avatar.png"
                  alt="govies.com team"
                  className="avatar"
                />
              )}
              <div className="message-content">
                <div className="sender-name">
                  {isUser ? 'You' : 'Govies.com Team'}
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="chat-bubble assistant typing">
            <img src="/govies-avatar.png" alt="govies.com team" className="avatar" />
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
