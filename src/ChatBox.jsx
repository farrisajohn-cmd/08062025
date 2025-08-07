import React, { useState, useEffect } from 'react';

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

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 3000); // 3-second delay before showing response
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ something went wrong. try again!' }]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === 'user';
    const isBot = msg.sender === 'assistant';

    return (
      <div key={i} style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px'
      }}>
        {!isUser && (
          <img
            src="/govies-avatar.png"
            alt="Govies Avatar"
            style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }}
          />
        )}
        <div style={{
          backgroundColor: isUser ? '#DCF8C6' : '#E4E6EB',
          color: '#000',
          padding: '12px 15px',
          borderRadius: '15px',
          maxWidth: '75%',
          whiteSpace: 'pre-wrap',
          fontWeight: /box [a-g]/i.test(msg.text) || /cash to close/i.test(msg.text) ? 'bold' : 'normal'
        }}>
          {!isUser && <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>govies.com team</div>}
          {msg.text}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map(renderMessage)}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <img
              src="/govies-avatar.png"
              alt="Govies Avatar"
              style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }}
            />
            <div style={{
              backgroundColor: '#E4E6EB',
              padding: '12px 15px',
              borderRadius: '15px',
              maxWidth: '75%',
              fontStyle: 'italic',
              opacity: 0.7
            }}>
              <span className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px', borderRadius: '5px' }}
        />
        <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '10px' }}>
          Send
        </button>
      </div>

      {/* Typing indicator CSS */}
      <style>
        {`
          .typing-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .typing-indicator .dot {
            width: 6px;
            height: 6px;
            margin: 0 2px;
            background-color: #555;
            border-radius: 50%;
            animation: blink 1.4s infinite both;
          }
          .typing-indicator .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-indicator .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes blink {
            0%, 80%, 100% {
              opacity: 0;
            }
            40% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ChatBox;
