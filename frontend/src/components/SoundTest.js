import React from 'react';
import { soundEffects } from '../utils/soundEffects';

const SoundTest = () => {
    const testSentSound = () => {
        soundEffects.playMessageSent();
    };

    const testReceivedSound = () => {
        soundEffects.playMessageReceived();
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <h2 className="text-xl font-bold">Sound Test Panel</h2>
            <div className="space-x-4">
                <button
                    onClick={testSentSound}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test Sent Sound
                </button>
                <button
                    onClick={testReceivedSound}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Test Received Sound
                </button>
            </div>
        </div>
    );
};

export default SoundTest; 