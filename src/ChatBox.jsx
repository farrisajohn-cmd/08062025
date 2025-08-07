import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatBox.css';
import avatar from './assets/govies-avatar.png'; // Make sure this is inside src/assets/

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      setTimeout(() => {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        setIsTyping(false);
      }, 1500); // typing delay
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const TypingIndicator = () => (
    <div className="message assistant typing">
      <img src={avatar} alt="govies.com team" className="avatar" />
      <div className="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && <img src={avatar} alt="govies.com team" className="avatar" />}
            <div className="bubble">
              {msg.role === 'assistant' && <div className="name">govies.com team</div>}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>send</button>
      </div>
    </div>
  );
}

export default ChatBox;
