import React, { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}><b>{msg.role}:</b> {msg.content}</div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;
