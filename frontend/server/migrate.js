const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

async function migrateData() {
    let client;
    try {
        client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true
        });

        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('hinglish_chat');
        const chatsCollection = db.collection('chats');

        // Get all old format documents
        const oldDocs = await chatsCollection.find({
            assistant_message: { $exists: true },
            assistant_messages: { $exists: false }
        }).toArray();

        console.log(`Found ${oldDocs.length} documents to migrate`);

        // Group documents by user_message and timestamp
        const groupedDocs = oldDocs.reduce((acc, doc) => {
            const key = `${doc.user_message}-${doc.timestamp.getTime()}`;
            if (!acc[key]) {
                acc[key] = {
                    user_message: doc.user_message,
                    assistant_messages: [],
                    timestamp: doc.timestamp,
                    user_ip: 'migrated_data'
                };
            }
            acc[key].assistant_messages.push({
                message: doc.assistant_message,
                timestamp: doc.timestamp
            });
            return acc;
        }, {});

        // Insert new format documents
        for (const key in groupedDocs) {
            const newDoc = groupedDocs[key];
            await chatsCollection.insertOne(newDoc);
        }

        // Delete old format documents
        await chatsCollection.deleteMany({
            assistant_message: { $exists: true },
            assistant_messages: { $exists: false }
        });

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

migrateData(); 