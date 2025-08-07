import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        sender: 'assistant',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
      };
      setTimeout(() => {
        setMessages([welcomeMsg]);
      }, 500);
    }
  }, [isOpen]);

  const handleSend = async () => {
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

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 3000); // Minimum 3-second delay
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ something went wrong. try again!' }]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <div className="chat-toggle" onClick={() => setIsOpen(true)}>
          <img src="/govies-avatar.png" alt="chat" />
        </div>
      )}

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <img src="/govies-avatar.png" alt="Govies" />
            <span>govies.com team</span>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <img className="avatar" src="/govies-avatar.png" alt="Govies" />
                )}
                <div className="bubble-text">
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble assistant">
                <img className="avatar" src="/govies-avatar.png" alt="Govies" />
                <div className="bubble-text">
                  <span className="dot-typing"><span>.</span><span>.</span><span>.</span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
