import React, { useState } from 'react';

const MessageInput = ({ onSend, loading, disabled }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !loading && !disabled) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <div className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md">
                <div className="flex items-center px-3 py-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={disabled}
                        className="flex-1 py-2 px-3 bg-white text-[14px] focus:outline-none text-gray-700 placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || loading || disabled}
                        className="p-1.5 bg-black rounded text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageInput; 