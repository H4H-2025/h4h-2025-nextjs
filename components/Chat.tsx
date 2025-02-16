"use client"
import React from 'react';

interface ChatProps {
  messages: { text: string; sender: 'user' | 'system' }[];  // Array of messages
  onMessageSelect: (message: string) => void;  // Callback for selecting messages
}

const Chat = ({ messages, onMessageSelect }: ChatProps) => {
  return (
    <div className="chat-container flex flex-col space-y-2">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} p-2`}
        >
          <div
            className={`max-w-[70%] p-3 ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} relative rounded-lg`}
            style={{
              borderRadius: '12px',
              position: 'relative',
              maxWidth: '80%',
            }}
          >
            <span>{message.text}</span>
            {message.sender === 'system' && (
              <button
                onClick={() => onMessageSelect(message.text)}
                className="ml-4 px-2 py-1 bg-blue-500 text-white rounded-md"
              >
                Select
              </button>
            )}
            {/* Tail for the chat bubble */}
            <div
              className={`absolute ${message.sender === 'user' ? 'right-[-10px] top-1/2' : 'left-[-10px] top-1/2'} w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${message.sender === 'user' ? 'border-l-[8px] border-l-blue-500' : 'border-r-[8px] border-r-gray-200'}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chat;
