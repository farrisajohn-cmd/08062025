import React, { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.response || "✅ message sent!",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ error: could not send message" },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: "0.5rem 0" }}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        style={{ width: "80%", padding: "0.5rem" }}
      />
      <button onClick={sendMessage} style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
        Send
      </button>
    </div>
  );
}

export default ChatBox;
