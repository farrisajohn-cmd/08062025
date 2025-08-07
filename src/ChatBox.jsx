import React, { useState, useEffect, useRef } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamAssistantMessage = async (text) => {
    const delay = 15;
    let currentText = '';
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'assistant', text: currentText }
      ]);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { sender: 'assistant', text: '' }]);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      await streamAssistantMessage(data.response);
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: 'assistant', text: '⚠️ something went wrong. try again!' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === 'user';
    return (
      <div key={i} style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? '#444' : '#222',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '18px',
        margin: '6px 0',
        maxWidth: '80%',
        whiteSpace: 'pre-wrap',
        fontSize: '15px',
        lineHeight: '1.4'
      }}>
        <strong>{isUser ? 'you' : 'govies'}:</strong> {msg.text}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#179942',
        padding: '14px 20px',
        fontWeight: 'bold',
        fontSize: '16px'
      }}>
        govies.com team
      </div>

      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        display: 'flex',
        borderTop: '1px solid #333',
        padding: '10px',
        backgroundColor: '#111'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            backgroundColor: '#222',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '5px',
            padding: '10px'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: '#179942',
            border: 'none',
            padding: '10px 16px',
            marginLeft: '10px',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
