import React, { useState, useEffect } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === 'user';

    // Bold section headers
    const formattedText = msg.text
      .replace(/(\*\*box [a-g][^*]*\*\*)/gi, '<strong>$1</strong>')
      .replace(/(\*\*calculating cash to close\*\*)/gi, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>');

    return (
      <div
        key={i}
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          backgroundColor: isUser ? '#444' : '#222',
          color: '#fff',
          padding: '10px',
          borderRadius: '10px',
          margin: '5px',
          maxWidth: '80%',
          whiteSpace: 'pre-wrap'
        }}
        dangerouslySetInnerHTML={{
          __html: `<strong>${isUser ? 'you' : 'govies'}:</strong> ${formattedText}`
        }}
      />
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantMessage = { sender: 'assistant', text: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let currentText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          currentText += chunk;

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              sender: 'assistant',
              text: currentText,
            };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error:', err);
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
