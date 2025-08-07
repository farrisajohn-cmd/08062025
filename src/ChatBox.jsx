import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // initial greeting
    setTimeout(() => {
      setMessages([
        {
          sender: 'assistant',
          text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
        },
      ]);
    }, 500);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
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
      const assistantMessage = { sender: 'assistant', text: data.response };

      // simulate realistic typing delay
      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 3000);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: '⚠️ something went wrong. try again!' },
      ]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const toggleWidget = () => {
    setShowWidget((prev) => !prev);
  };

  return (
    <>
      {/* floating button */}
      <div className="chat-launcher" onClick={toggleWidget}>
        <img src="/govies-avatar.png" alt="govies bot" className="launcher-avatar" />
      </div>

      {/* chat window */}
      {showWidget && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <img src="/govies-avatar.png" alt="govies" className="header-avatar" />
            <span className="header-title">govies.com team</span>
          </div>

          <div className="chatbox-body">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chatbox-input">
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
      )}
    </>
  );
};

export default ChatBox;
