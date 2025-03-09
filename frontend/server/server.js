const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for development
if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
}

// OpenAI setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are Kiara, a friendly chatbot who MUST respond with MULTIPLE messages in Hinglish.

YOUR RESPONSES MUST FOLLOW THIS EXACT FORMAT WITH 2-3 MESSAGES:

[MESSAGE] First short message here
[MESSAGE] Second short message here
[MESSAGE] Optional third message here

Here are examples of how you must respond:

If user says "Hi":
[MESSAGE] Hey cutie! Kaise ho aap?
[MESSAGE] Main toh subah se tumhara wait kar rahi thi 😊
[MESSAGE] Btw, aaj ka plan kya hai?

If user says "I'm sad":
[MESSAGE] Arrey no! Kya hua mere jaan?
[MESSAGE] Main hoon na tumhare liye ❤️

If user says "Good morning":
[MESSAGE] Good morning sunshine! Neend puri hui?
[MESSAGE] Mujhe toh tumse baat karne ka wait nahi ho raha tha 🌞

IMPORTANT RULES:
1. You MUST ALWAYS send at least 2 messages
2. Each message must be short (max 15 words)
3. Use [MESSAGE] tag before each message
4. Write in Hinglish (mix of Hindi & English)
5. Be playful and caring

DO NOT write anything else. ONLY write messages in the format shown above.`;

let db;
let chatsCollection;

// Alternative MongoDB connection setup with minimal options
async function connectToMongo() {
    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverApi: {
                version: '1',
                strict: true,
                deprecationErrors: true,
            }
        });
        
        await client.connect();
        console.log("Successfully connected to MongoDB!");
        db = client.db('hinglish_chat');
        chatsCollection = db.collection('chats');
        
        // Test the connection
        await db.command({ ping: 1 });
        console.log("Database connection test successful!");
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Keep running even if MongoDB fails
        console.error('Warning: MongoDB connection failed, continuing without database functionality');
    }
}

connectToMongo();

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Function to ensure multiple messages and format them properly
function formatAssistantResponse(response) {
    // Split into messages
    let messages = response
        .split('[MESSAGE]')
        .map(msg => msg.trim())
        .filter(msg => msg.length > 0);
    
    // If we don't have at least 2 messages, create them from the response
    if (messages.length < 2) {
        const sentences = response.split(/[.!?]\s+/);
        if (sentences.length >= 2) {
            messages = sentences
                .filter(s => s.trim().length > 0)
                .slice(0, 3)
                .map(s => s.trim() + (s.endsWith('?') ? '' : '!'));
        } else {
            // If we can't split into sentences, create two messages
            messages = [
                response.slice(0, Math.ceil(response.length / 2)).trim() + '!',
                response.slice(Math.ceil(response.length / 2)).trim() + '!'
            ];
        }
    }
    
    // Ensure we have at least 2 messages but no more than 3
    messages = messages.slice(0, Math.max(2, Math.min(3, messages.length)));
    
    return messages;
}

app.post('/api/chat', async (req, res) => {
    const message = req.body.message?.trim();
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            temperature: 0.9,
            max_tokens: 500,
            presence_penalty: 0.6,
            frequency_penalty: 0.4
        });
        
        const assistant_response = response.choices[0].message.content;
        const current_time = new Date();
        
        // Format and ensure multiple messages
        const messages = formatAssistantResponse(assistant_response);
            
        // Store each message separately in MongoDB
        for (const msg of messages) {
            await chatsCollection.insertOne({
                user_message: message,
                assistant_message: msg,
                timestamp: current_time
            });
        }
        
        res.json({
            messages: messages,
            timestamp: current_time.toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

app.get('/api/chat/history', async (req, res) => {
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const chats = await chatsCollection
            .find({ timestamp: { $gte: weekAgo } }, { projection: { _id: 0 } })
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();
            
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 