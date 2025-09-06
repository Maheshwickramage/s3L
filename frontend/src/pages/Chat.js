import React, { useState } from 'react';

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    // For demo, just add to local state
    setMessages([...messages, { sender: user.username, text }]);
    setText('');
    // In a real app, send to backend and fetch all messages
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h3>Chat with Teacher</h3>
      <div style={{ border: '1px solid #ccc', minHeight: 100, marginBottom: 10, padding: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.sender}:</b> {msg.text}</div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
