const fs = require('fs');
const path = require('path');

/**
 * Load and chunk all policy files for local searching.
 */
const loadPolicies = () => {
    const policyDir = path.join(__dirname, '../data/policies');
    let allContent = [];

    if (fs.existsSync(policyDir)) {
        const files = fs.readdirSync(policyDir).filter(f => f.endsWith('.txt'));
        files.forEach(file => {
            const filePath = path.join(policyDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            // Chunk by paragraphs to maintain context
            const chunks = content.split('\n\n').filter(p => p.trim().length > 10);
            chunks.forEach(chunk => {
                allContent.push({
                    text: chunk.trim(),
                    source: file.replace('.txt', '').replace(/_/g, ' ').toUpperCase()
                });
            });
        });
    }

    return allContent;
};

/**
 * Local keyword-based retrieval
 */
exports.retrieveContext = async (query) => {
    const policies = loadPolicies();
    const queryLower = query.toLowerCase();
    const terms = queryLower.split(/\s+/).filter(t => t.length > 3);

    // Simple scoring based on term frequency
    const scoredChunks = policies.map(chunk => {
        const textLower = chunk.text.toLowerCase();
        let score = 0;

        // Exact small query match (e.g. "HRA")
        if (queryLower.length < 10 && textLower.includes(queryLower)) score += 10;

        terms.forEach(term => {
            if (textLower.includes(term)) score += 5;
        });

        return { ...chunk, score };
    });

    // Return top 5 relevant chunks
    return scoredChunks
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

exports.indexPolicies = async () => {
    console.log('📑 Local policy search system initialized.');
};
