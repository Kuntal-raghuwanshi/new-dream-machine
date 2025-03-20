import React from 'react';

const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const SingleTick = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="11" viewBox="0 0 16 11" className="inline-block ml-1 -mt-[1px]">
        <path fill="#666" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
    </svg>
);

const DoubleTick = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="11" viewBox="0 0 16 11" className="inline-block ml-1 -mt-[1px]">
        <path fill="#666" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
    </svg>
);

const BlueDoubleTick = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="11" viewBox="0 0 16 11" className="inline-block ml-1 -mt-[1px]">
        <path fill="#53bdeb" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
    </svg>
);

const TypingIndicator = () => (
    <div className="flex items-center space-x-2 px-4 py-2">
        <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-pulse delay-75 mx-1"></div>
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-pulse delay-150"></div>
        </div>
        <span className="text-[13px] text-gray-500">Kuvy is typing</span>
    </div>
);

const MessageList = ({ messages, isTyping }) => {
    return (
        <div className="space-y-4">
            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            message.type === 'user'
                                ? 'bg-[#fff9e6] text-gray-800'
                                : 'bg-white text-gray-800'
                        }`}
                    >
                        <p className="text-[15px]">{message.content}</p>
                        <div className="flex items-center justify-end mt-1">
                            <p className="text-[11px] text-gray-400">
                                {formatTimestamp(message.timestamp)}
                                {message.type === 'user' && (
                                    <>
                                        {message.status === 'sent' && <SingleTick />}
                                        {message.status === 'delivered' && <DoubleTick />}
                                        {message.status === 'read' && <BlueDoubleTick />}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && <TypingIndicator />}
        </div>
    );
};

export default MessageList; 