const dotenv = require('dotenv');
path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("DEBUG | GEMINI_API_KEY length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set in .env");
    process.exit(1);
}

const ragService = require('./src/services/ragService');

async function testRAG() {
    console.log("🚀 Starting RAG Verification Test...");

    // 1. Test Indexing
    await ragService.indexPolicies();

    // 2. Test Retrieval
    const query = "What is the HRA percentage?";
    console.log(`\n🔍 Querying: "${query}"`);
    const context = await ragService.retrieveContext(query);

    console.log("\n📄 Relevant Chunks Found:");
    context.forEach((c, i) => {
        console.log(`[${i + 1}] Source: ${c.source} | Score: ${c.score.toFixed(4)}`);
        console.log(`   Text: ${c.text.substring(0, 100)}...`);
    });

    if (context.length > 0 && context[0].text.includes("40%")) {
        console.log("\n✅ SUCCESS: Found correct HRA percentage in context.");
    } else {
        console.log("\n❌ FAILURE: Could not find HRA info in context.");
    }
}

testRAG().catch(err => {
    console.error("Test failed:", err);
    if (err.stack) console.error(err.stack);
});
