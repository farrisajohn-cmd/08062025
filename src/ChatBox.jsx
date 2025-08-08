import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const response = await getBotReply(input);
      setMessages((prev) => [...prev, { sender: 'assistant', text: response }]);
      setIsTyping(false);
    }, 3000); // 3-second delay
  };

  const getBotReply = async (msg) => {
    try {
      const response = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msg }),
      });

      const data = await response.json();
      return data.reply || 'sorry, something went wrong.';
    } catch (err) {
      console.error('backend error:', err);
      return 'sorry, i had trouble reaching the server.';
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      },
    ]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <span>govies.com team</span>
            <div className="chatbox-buttons">
              <button onClick={clearChat}>⟲</button>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chatbox-body">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <div
                    key={i}
                    dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                ))}
              </div>
            ))}
            {isTyping && (
              <div className="typing">
                govies.com team is typing<span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          <div className="chatbox-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type your message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
