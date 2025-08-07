import React, { useState } from 'react';

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

    const formattedText = msg.text
      .replace(/\*\*(box [a-g][^*]*)\*\*/gi, '<strong>$1</strong>')
      .replace(/\*\*(calculating cash to close)\*\*/gi, '<strong>$1</strong>')
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

    // Initialize empty assistant message for streaming
    setMessages(prev => [...prev, { sender: 'assistant', text: '' }]);

    try {
      const res = await fetch('https://zero8062025.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;

          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              sender: 'assistant',
              text: fullText
            };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('streaming error:', err);
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
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map(renderMessage)}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '10px',
            backgroundColor: '#444',
            borderRadius: '10px',
            margin: '5px',
            maxWidth: '80%',
            fontStyle: 'italic',
            color: '#ccc'
          }}>
            typing...
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
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: '10px',
            padding: '10px',
            backgroundColor: '#179942',
            color: 'white',
            border: 'none',
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
