const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGen() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("✅ API Key is working for generation.");
    } catch (e) {
        console.error("❌ API Key failed for generation:", e);
    }
}

testGen();
