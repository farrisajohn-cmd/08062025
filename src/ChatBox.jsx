import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const assistantReply = await simulateTyping(data.response);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'assistant', text: assistantReply },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'assistant', text: "sorry — there was an error. please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const simulateTyping = async (text) => {
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(3000); // minimum delay of 3 seconds
    return text;
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'assistant',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      },
    ]);
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  return (
    <div className="chatbot-container">
      {showChat ? (
        <div className="chatbox">
          <div className="chat-header">
            <div className="chat-header-left">
              <img src="/govies-avatar.png" alt="govies avatar" className="avatar" />
              <span className="bot-name">govies.com team</span>
            </div>
            <div className="chat-header-right">
              <button onClick={handleClear}>⟲</button>
              <button onClick={toggleChat}>✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <img src="/govies-avatar.png" alt="avatar" className="avatar" />
                )}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <img src="/govies-avatar.png" alt="avatar" className="avatar" />
                <div className="message-text typing">typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chat-input">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <div className="chat-toggle-button" onClick={toggleChat}>
          💬
        </div>
      )}
    </div>
  );
}

export default ChatBox;
