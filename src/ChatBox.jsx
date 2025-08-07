import React, { useState, useEffect, useRef } from 'react';
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
  const [currentReply, setCurrentReply] = useState('');
  const replyIntervalRef = useRef(null);

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
      const fullReply = data.response || '⚠️ assistant failed to respond.';
      
      // simulate realistic typing animation
      let index = 0;
      setCurrentReply('');
      const delayStart = Date.now();
      
      replyIntervalRef.current = setInterval(() => {
        const now = Date.now();
        if (now - delayStart >= 3000) {
          setCurrentReply(fullReply.slice(0, index));
          index++;
          if (index > fullReply.length) {
            clearInterval(replyIntervalRef.current);
            setMessages(prev => [...prev, { sender: 'assistant', text: fullReply }]);
            setCurrentReply('');
            setIsTyping(false);
          }
        }
      }, 15);

    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ something went wrong. try again!' }]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              {msg.sender === 'assistant' && (
                <img src="/govies-avatar.png" alt="govies.com team" className="chat-avatar" />
              )}
              <div className="chat-content">
                <span className="chat-sender">
                  {msg.sender === 'assistant' ? 'govies.com team' : 'you'}
                </span>
                <div className="chat-text">{msg.text}</div>
              </div>
            </div>
          ))}

          {currentReply && (
            <div className="chat-bubble assistant">
              <img src="/govies-avatar.png" alt="govies.com team" className="chat-avatar" />
              <div className="chat-content">
                <span className="chat-sender">govies.com team</span>
                <div className="chat-text">{currentReply}</div>
              </div>
            </div>
          )}

          {isTyping && !currentReply && (
            <div className="chat-bubble assistant">
              <img src="/govies-avatar.png" alt="govies.com team" className="chat-avatar" />
              <div className="chat-content typing">
                <span className="chat-sender">govies.com team</span>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="type your message..."
            className="chat-input"
          />
          <button onClick={sendMessage} className="chat-send-btn">send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
