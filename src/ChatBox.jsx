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

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === 'user';
    return (
      <div key={i} style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? '#DCF8C6' : '#FFF',
        color: '#000',
        padding: '10px',
        borderRadius: '10px',
        margin: '5px',
        maxWidth: '80%',
        whiteSpace: 'pre-wrap',
        fontWeight: /box [a-g]/i.test(msg.text) || /cash to close/i.test(msg.text) ? 'bold' : 'normal'
      }}>
        <strong>{isUser ? 'You' : 'Govies'}:</strong> {msg.text}
      </div>
    );
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
      const assistantMessage = { sender: 'assistant', text: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ something went wrong. try again!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
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
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
        {messages.map(renderMessage)}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '10px',
            backgroundColor: '#FFF',
            borderRadius: '10px',
            margin: '5px',
            maxWidth: '80%',
            fontStyle: 'italic',
            opacity: 0.6
          }}>
            Govies is typing...
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
    </div>
  );
};

export default ChatBox;
