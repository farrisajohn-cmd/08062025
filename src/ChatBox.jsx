import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      text: "hey! welcome to govies.com — i’m your FHA expert on call. ready to quote rates, explain payments, or show you what your loan would look like. just tell me what you need!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://zero8062025.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { text: data.response, sender: "bot" };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 3000);
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbox-container ${isOpen ? "open" : ""}`}>
      {!isOpen && (
        <div className="chatbox-toggle" onClick={() => setIsOpen(true)}>
          <img src="/govies-avatar.png" alt="govies.com team" />
        </div>
      )}
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <img src="/govies-avatar.png" alt="govies.com team" />
            <span className="bot-name">govies.com team</span>
          </div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.sender === "bot" && (
                  <img className="avatar" src="/govies-avatar.png" alt="govies.com team" />
                )}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <img className="avatar" src="/govies-avatar.png" alt="govies.com team" />
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
