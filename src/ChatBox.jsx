import React, { useState } from 'react';
import './ChatBox.css';

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

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === 'user';
    return (
      <div className={`message-row ${isUser ? 'user' : 'assistant'}`} key={i}>
        {!isUser && (
          <img src="/govies-avatar.png" alt="govies" className="avatar" />
        )}
        <div className={`bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          <div className="sender-name">{isUser ? 'You' : 'govies.com team'}</div>
          <div className="message-text">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="chatbox-container">
      <div className="messages-container">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="message-row assistant">
            <img src="/govies-avatar.png" alt="govies" className="avatar" />
            <div className="bubble assistant-bubble">
              <div className="sender-name">govies.com team</div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="input-container">
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
