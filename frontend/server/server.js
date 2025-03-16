const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const cors = require('cors');

// Add debug logging
console.log('Server initialization starting...');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Environment:', process.env.NODE_ENV);

// Load environment variables based on environment
if (process.env.NODE_ENV === 'production') {
    console.log('Loading production environment variables from Vercel');
} else {
    console.log('Loading local environment variables');
    dotenv.config();
}

const app = express();

// Enable CORS with dynamic origin in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            /\.vercel\.app$/, // Allow all vercel.app subdomains
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
            'http://localhost:3000' // Allow local development
          ].filter(Boolean)
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

console.log('CORS configuration:', corsOptions);
app.use(cors(corsOptions));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers
    });
    next();
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    console.log('Serving static files from:', path.join(__dirname, '../../build'));
    app.use(express.static(path.join(__dirname, '../../build')));
    
    // Catch-all route for SPA in production
    app.get('*', (req, res) => {
        // Log the request path for debugging
        console.log('Catch-all route hit:', req.path);
        if (req.path.startsWith('/api/')) {
            // Let API routes fall through to their handlers
            return next();
        }
        res.sendFile(path.join(__dirname, '../../build/index.html'));
    });
}

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        console.log('Using cached database connection');
        return cachedDb;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Successfully connected to MongoDB');
        
        const db = client.db('hinglish_chat');
        cachedDb = db;
        
        // Test the connection
        await db.command({ ping: 1 });
        console.log('Database ping successful');
        
        return db;
    } catch (error) {
        console.error('MongoDB connection error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            name: error.name
        });
        cachedDb = null;
        throw error;
    }
}

// OpenAI setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Health check endpoint with detailed diagnostics
app.get('/api/health', async (req, res) => {
    try {
        console.log('Health check initiated');
        console.log('Server environment:', {
            node_env: process.env.NODE_ENV,
            cwd: process.cwd(),
            dirname: __dirname,
            mongodb_uri_exists: !!process.env.MONGODB_URI,
            openai_key_exists: !!process.env.OPENAI_API_KEY
        });

        const db = await connectToDatabase();
        const pingResult = await db.command({ ping: 1 });
        
        const diagnostics = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            mongodb: {
                connected: true,
                ping: pingResult.ok === 1 ? 'successful' : 'failed',
                uri_exists: !!process.env.MONGODB_URI
            },
            openai: {
                api_key_exists: !!process.env.OPENAI_API_KEY
            },
            server: {
                node_version: process.version,
                platform: process.platform,
                cwd: process.cwd(),
                dirname: __dirname
            }
        };
        
        console.log('Health check diagnostics:', diagnostics);
        res.json(diagnostics);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            error: {
                message: error.message,
                type: error.name,
                code: error.code
            },
            timestamp: new Date().toISOString()
        });
    }
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
        const db = await connectToDatabase();
        const chatsCollection = db.collection('chats');
        
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
        const db = await connectToDatabase();
        const chatsCollection = db.collection('chats');
        
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

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('OpenAI API key exists:', !!process.env.OPENAI_API_KEY);
});

// Export the Express API
module.exports = app; 