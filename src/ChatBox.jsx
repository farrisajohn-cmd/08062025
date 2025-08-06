import React, { useState } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('https://zero08062025.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!res.ok) throw new Error('Response not OK');

      const data = await res.json();
      const botMessage = { sender: 'assistant', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      const errorMsg = { sender: 'assistant', text: '⚠️ error: could not send message' };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder="Type your message..."
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ padding: '8px', width: '300px' }}
      />
      <button onClick={sendMessage} style={{ marginLeft: '10px', padding: '8px' }}>
        Send
      </button>
    </div>
  );
};

export default ChatBox;
