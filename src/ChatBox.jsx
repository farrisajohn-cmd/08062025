import React, { useState, useEffect } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initialGreeting, setInitialGreeting] = useState(false);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    if (!initialGreeting) {
      setInitialGreeting(true);
      simulateAssistantMessage("hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!");
    }
  }, [initialGreeting]);

  const simulateAssistantMessage = async (text) => {
    setIsTyping(true);
    await delay(3000); // min 3s delay
    setMessages(prev => [...prev, { sender: 'assistant', text }]);
    setIsTyping(false);
  };

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
      await delay(3000); // min 3s delay
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

  const renderMessage = (msg, index) => {
    const isUser = msg.sender === 'user';
    const className = isUser ? 'user-message' : 'assistant-message';

    return (
      <div key={index} className={`message-row ${isUser ? 'user' : 'assistant'}`}>
        {!isUser && (
          <img src="/govies-avatar.png" alt="govies avatar" className="avatar" />
        )}
        <div className={`message-bubble ${className}`}>
          {!isUser && <div className="sender-name">govies.com team</div>}
          <div className="message-text">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="message-container">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="message-row assistant">
            <img src="/govies-avatar.png" alt="govies avatar" className="avatar" />
            <div className="message-bubble assistant-message">
              <div className="sender-name">govies.com team</div>
              <div className="typing-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="type your message..."
        />
        <button onClick={sendMessage}>send</button>
      </div>
    </div>
  );
};

export default ChatBox;
