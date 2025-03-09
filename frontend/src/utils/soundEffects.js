class SoundEffects {
    constructor() {
        this.messageReceived = new Audio('/sounds/message-received.mp3');
        this.messageSent = new Audio('/sounds/message-sent.mp3');
        
        // Pre-load sounds
        this.messageReceived.load();
        this.messageSent.load();
        
        // Set volume
        this.messageReceived.volume = 0.5;
        this.messageSent.volume = 0.3;
    }

    playMessageReceived() {
        this.messageReceived.currentTime = 0;
        this.messageReceived.play().catch(err => console.log('Sound playback prevented'));
    }

    playMessageSent() {
        this.messageSent.currentTime = 0;
        this.messageSent.play().catch(err => console.log('Sound playback prevented'));
    }
}

export const soundEffects = new SoundEffects(); 