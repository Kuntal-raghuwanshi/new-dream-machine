import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { PROFILE } from '../constants/profile';

const LandingPage = () => {
    const [showChat, setShowChat] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative min-h-screen">
            {/* Desktop Hero Section */}
            <div className="hidden md:block relative h-screen">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent">
                    <img 
                        src="/images/hero-background.jpg" 
                        alt="Happy Couple" 
                        className="w-full h-full object-cover mix-blend-overlay"
                    />
                </div>
                <div className="relative z-10 h-full grid grid-cols-8 gap-8 max-w-[1440px] mx-auto px-8">
                    {/* Left Content - Spans 5 columns */}
                    <div className="col-span-5 xl:col-span-4 flex items-center">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center space-x-2 bg-black/30 rounded-full px-4 py-2 mb-6">
                                <span className="w-5 h-5">🇮🇳</span>
                                <span className="text-white text-sm">The AI companion for Indians</span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                                Perfect Girlfriend,<br />
                                Created for You.
                            </h1>
                            <p className="text-lg lg:text-xl text-white/80 mb-8">
                                Private, secure, and deeply personal—she listens,<br />
                                understands, and evolves with you.
                            </p>
                            <button
                                onClick={() => setShowChat(true)}
                                className="bg-[#FF6B6B] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#FF5252] transition-colors"
                            >
                                Talk to Kuvy
                            </button>
                        </div>
                    </div>
                    
                    {/* Right Content - Chat Preview - Spans 3 columns */}
                    <div className="col-span-3 xl:col-span-4 flex items-center justify-center">
                        <div className="w-[320px] lg:w-[340px] xl:w-[380px] 2xl:w-[420px] h-[480px] lg:h-[500px] xl:h-[560px] 2xl:h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex-shrink-0 transform xl:translate-x-8 2xl:translate-x-16">
                            {/* Chat Header */}
                            <div className="px-6 py-4 flex items-center space-x-3 border-b border-gray-100">
                                <div className="relative">
                                    <img 
                                        src={PROFILE.avatar}
                                        alt={PROFILE.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-[17px] font-semibold text-gray-900">{PROFILE.name}</h1>
                                    <p className="text-[13px] text-green-500 font-medium">{PROFILE.status}</p>
                                </div>
                            </div>
                            
                            {/* Chat Messages */}
                            <div className="flex-1 px-6 space-y-6 overflow-y-auto bg-white h-[calc(100%-140px)]">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-[#fff9e6] rounded-2xl px-4 py-3 max-w-[85%]">
                                        <p className="text-[15px] text-gray-900">Hey, Kesi ho?</p>
                                        <p className="text-[11px] text-gray-500 text-right mt-1">12:48</p>
                                    </div>
                                </div>
                                
                                {/* Assistant Message */}
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                                        <p className="text-[15px] text-gray-900">Aww, mujhe bhi tumse baat krke khushi hoti hai!</p>
                                        <p className="text-[11px] text-gray-500 text-right mt-1">12:48</p>
                                    </div>
                                </div>
                                
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-[#fff9e6] rounded-2xl px-4 py-3 max-w-[85%]">
                                        <p className="text-[15px] text-gray-900">I'm Good</p>
                                        <p className="text-[11px] text-gray-500 text-right mt-1">12:48</p>
                                    </div>
                                </div>
                                
                                {/* Assistant Message */}
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                                        <p className="text-[15px] text-gray-900">Bhadiyaan h yaar</p>
                                        <p className="text-[11px] text-gray-500 text-right mt-1">12:48</p>
                                    </div>
                                </div>

                                {/* Assistant Message */}
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                                        <p className="text-[15px] text-gray-900">Tum Kya kr rhe ho?</p>
                                        <p className="text-[11px] text-gray-500 text-right mt-1">12:48</p>
                                    </div>
                                </div>
                                
                                {/* Typing Indicator */}
                                <div className="flex items-center space-x-2 px-4 py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                    <span className="text-[13px] text-gray-500">Kuvy is typing...</span>
                                </div>
                            </div>
                            
                            {/* Chat Input */}
                            <div className="px-6 py-4 bg-white border-t border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 py-3 px-4 bg-gray-50 rounded-full text-[15px] focus:outline-none border border-gray-200 text-gray-700"
                                    />
                                    <button className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Hero Section */}
            <div className="md:hidden relative min-h-screen bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90">
                    <img 
                        src="/images/hero-background.jpg" 
                        alt="Happy Couple" 
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
                <div className="relative z-10 px-6 pt-16 flex flex-col min-h-screen">
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <div className="inline-flex items-center space-x-2 bg-black/30 rounded-full px-4 py-2 mb-6">
                            <span className="w-5 h-5">🇮🇳</span>
                            <span className="text-white text-sm">The AI companion for Indians</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Perfect AI<br />
                            Girlfriend,<br />
                            Created for You.
                        </h1>
                        <p className="text-white/80 text-base mb-8">
                            Private, secure, and deeply personal<br />
                            she listens, understands, and<br />
                            evolves with you.
                        </p>
                        <button
                            onClick={() => setShowChat(true)}
                            className="bg-[#FF6B6B] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#FF5252] transition-colors w-full max-w-xs"
                        >
                            Talk to Kuvy
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            {showChat && (
                <div className="fixed inset-0 z-50 bg-white w-full h-full">
                    <div className="w-full h-full">
                        <ChatWindow />
                        {!isMobile && (
                            <button
                                onClick={() => setShowChat(false)}
                                className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage; 