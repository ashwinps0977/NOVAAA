const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testEmbedding() {
    console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try multiple model strings
    const models = ["models/embedding-001", "embedding-001", "text-embedding-004"];

    for (const modelName of models) {
        try {
            console.log(`\nTesting model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.embedContent("Hello world");
            console.log(`✅ Success with ${modelName}! Embedding length:`, result.embedding.values.length);
            return; // Stop if one works
        } catch (e) {
            console.error(`❌ Failed with ${modelName}:`, e.message);
        }
    }
}

testEmbedding();
