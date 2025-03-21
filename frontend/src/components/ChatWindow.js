import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import axios from 'axios';
import { PROFILE } from '../constants/profile';

// Add this near the top of your file, after imports
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Construct API URL correctly
const getApiUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) return window.location.origin;
    
    // Check if it's already a full URL
    if (apiUrl.startsWith('http')) return apiUrl;
    
    // If it's just the domain from VERCEL_URL, construct the full URL
    return `https://${apiUrl}`;
};

const API_URL = getApiUrl();
console.log('Build Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: API_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    window_location: window.location.origin
});

const ChatWindow = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [initialLoading, setInitialLoading] = useState(true);
    const [initError, setInitError] = useState(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setInitialLoading(true);
                setError(null);
                
                // Test if we can load static assets
                const testImage = new Image();
                testImage.onerror = (e) => {
                    console.error('Failed to load static assets:', e);
                    setInitError('Failed to load application resources. Please try refreshing the page.');
                };
                testImage.onload = () => {
                    console.log('Static assets loaded successfully');
                };
                // Use an existing image from our public directory
                testImage.src = `${window.location.origin}/images/kiara-avatar.jpg`;

                // Test API connection
                const response = await axios.get(`${API_URL}/api/health`);
                console.log('Health check response:', response.data);
                
                setInitialLoading(false);
            } catch (error) {
                console.error('Initialization error:', error);
                setInitError(error.message);
                setInitialLoading(false);
            }
        };

        initializeApp();
    }, []);

    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                console.log('Testing backend connection...');
                const response = await axios.get(`${API_URL}/api/health`);
                console.log('Backend health check response:', response.data);
                setConnectionStatus('connected');
                return true;
            } catch (error) {
                console.error('Backend connection error:', error);
                setConnectionStatus('disconnected');
                setError('Cannot connect to server. Please check if backend is running.');
                return false;
            }
        };

        const loadChatHistory = async () => {
            try {
                setLoadingHistory(true);
                setError(null);
                
                // Check backend connection first
                const isConnected = await checkBackendConnection();
                if (!isConnected) return;
                
                const response = await axios.get(`${API_URL}/api/chat/history`);
                console.log('Chat history received:', response.data);
                
                // The response.data is already in the correct format with alternating user and assistant messages
                setMessages(response.data);
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response,
                    status: error.response?.status,
                    data: error.response?.data
                });
                setError(error.message === 'Network Error' ? 
                    'Cannot connect to server. Please check if backend is running.' : 
                    `Failed to load chat history: ${error.message}`);
            } finally {
                setLoadingHistory(false);
            }
        };

        loadChatHistory();
    }, []);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShowScrollDown(!isNearBottom);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Add effect to scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
            return () => chatContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const sendMessage = async (message) => {
        if (!message.trim()) return;
        
        console.log('Sending message:', message);
        setError(null);
        setLoading(true);
        
        const newUserMessage = { 
            type: 'user', 
            content: message,
            timestamp: new Date().toISOString(),
            status: 'sent'  // Initial single tick
        };
        
        // Add the initial message
        setMessages(prev => [...prev, newUserMessage]);
        
        try {
            // After 2 seconds, show double black ticks
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMessages(prev => 
                prev.map(msg => 
                    msg.content === newUserMessage.content && 
                    msg.timestamp === newUserMessage.timestamp ? 
                        { ...msg, status: 'delivered' } : msg
                )
            );

            // After 2 more seconds, show blue ticks
            await new Promise(resolve => setTimeout(resolve, 2000));
            setMessages(prev => 
                prev.map(msg => 
                    msg.content === newUserMessage.content && 
                    msg.timestamp === newUserMessage.timestamp ? 
                        { ...msg, status: 'read' } : msg
                )
            );

            // Then show typing indicator
            setIsTyping(true);
            
            // Wait for 2 seconds with typing indicator before making the API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Making API request to chat endpoint...');
            const response = await axios.post(`${API_URL}/api/chat`, {
                message: message
            });
            
            console.log('Received response:', response.data);
            
            // Handle both array and single message formats
            const messageArray = Array.isArray(response.data.messages) 
                ? response.data.messages 
                : [response.data.message || response.data.messages];

            // Add each message from the response with a small delay between them
            for (let i = 0; i < messageArray.length; i++) {
                const assistantMessage = {
                    type: 'assistant',
                    content: messageArray[i],
                    timestamp: new Date(Date.parse(response.data.timestamp) + i * 1000).toISOString()
                };
                
                setMessages(prev => [...prev, assistantMessage]);
                
                // Add a small delay between messages if there are more to come
                if (i < messageArray.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error('Chat error details:', {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data
            });
            setError(`Failed to send message: ${error.message}`);
        } finally {
            setLoading(false);
            setIsTyping(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading application...</p>
                </div>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-red-500 text-xl mb-4">⚠️ Application Error</div>
                    <p className="text-gray-600 mb-4">{initError}</p>
                    <div className="bg-gray-100 p-4 rounded text-left">
                        <p className="text-sm font-mono break-all">
                            Environment: {process.env.NODE_ENV}<br/>
                            API URL: {API_URL}<br/>
                            Location: {window.location.origin}
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F5F2EC] min-h-screen">
            <div className="max-w-[800px] mx-auto h-screen">
                <div className="flex flex-col h-full">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img 
                                    src={PROFILE.avatar}
                                    alt={PROFILE.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                                    connectionStatus === 'connected' ? 'bg-green-500' :
                                    connectionStatus === 'disconnected' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                }`} />
                            </div>
                            <div>
                                <h1 className="text-gray-800 font-medium">{PROFILE.name}</h1>
                                <p className={`text-sm ${
                                    connectionStatus === 'connected' ? 'text-green-500' :
                                    connectionStatus === 'disconnected' ? 'text-red-500' :
                                    'text-yellow-500'
                                }`}>
                                    {connectionStatus === 'connected' ? 'Online' :
                                     connectionStatus === 'disconnected' ? 'Offline' :
                                     'Connecting...'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto no-scrollbar p-6"
                    >
                        {loadingHistory ? (
                            <div className="flex flex-col justify-center items-center h-full space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                <p className="text-gray-500">Loading chat history...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-gray-500">
                                <p className="text-lg mb-2">Welcome to Kuvy Chat!</p>
                                <p className="text-sm">Start a conversation by sending a message.</p>
                            </div>
                        ) : (
                            <>
                                <MessageList messages={messages} isTyping={isTyping} />
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>
                    <div className="relative">
                        {showScrollDown && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute right-6 -top-12 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                        <MessageInput 
                            onSend={sendMessage} 
                            loading={loading} 
                            disabled={loadingHistory || !!error}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow; 