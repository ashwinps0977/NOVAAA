const { NlpManager } = require('node-nlp');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train the model
// Train the model
const trainModel = async () => {
    console.log('🤖 Training AI Model...');

    // Intent: Leave Balance
    manager.addDocument('en', 'how many leaves do i have left', 'leave.balance');
    manager.addDocument('en', 'check my leave balance', 'leave.balance');
    manager.addDocument('en', 'what is my remaining leave', 'leave.balance');
    manager.addDocument('en', 'show me my leave quota', 'leave.balance');

    // Intent: Apply Leave
    manager.addDocument('en', 'i want to apply for leave', 'leave.apply');
    manager.addDocument('en', 'apply for sick leave', 'leave.apply');
    manager.addDocument('en', 'i need a day off', 'leave.apply');
    manager.addDocument('en', 'request leave for tomorrow', 'leave.apply');
    manager.addDocument('en', 'take leave from %date% to %date%', 'leave.apply');
    manager.addDocument('en', 'from %date% to %date%', 'leave.apply'); // Follow-up context
    manager.addDocument('en', 'i want apply for a leave', 'leave.apply'); // Specific user phrasing
    manager.addDocument('en', 'from 13th to 15th january', 'leave.apply'); // Specific date pattern training

    // Intent: Employee Info
    manager.addDocument('en', 'what is my role', 'employee.info');
    manager.addDocument('en', 'show my profile', 'employee.info');
    manager.addDocument('en', 'who am i', 'employee.info');
    manager.addDocument('en', 'my details', 'employee.info');

    // Intent: Greetings
    manager.addDocument('en', 'hello', 'greeting');
    manager.addDocument('en', 'hi', 'greeting');
    manager.addDocument('en', 'good morning', 'greeting');

    // Intent: HR Policies
    manager.addDocument('en', 'what are the working hours', 'policy.hours');
    manager.addDocument('en', 'office timings', 'policy.hours');
    manager.addDocument('en', 'when does work start', 'policy.hours');

    manager.addDocument('en', 'what is the dress code', 'policy.dress');
    manager.addDocument('en', 'can i wear jeans', 'policy.dress');
    manager.addDocument('en', 'dress policy', 'policy.dress');

    manager.addDocument('en', 'list of holidays', 'policy.holidays');
    manager.addDocument('en', 'when is the next holiday', 'policy.holidays');
    manager.addDocument('en', 'holiday calendar', 'policy.holidays');

    manager.addDocument('en', 'medical insurance benefits', 'policy.benefits');
    manager.addDocument('en', 'what benefits do i have', 'policy.benefits');
    manager.addDocument('en', 'pf and insurance', 'policy.benefits');

    // Intent: Small Talk
    manager.addDocument('en', 'thank you', 'smalltalk.thanks');
    manager.addDocument('en', 'thanks', 'smalltalk.thanks');
    manager.addDocument('en', 'bye', 'smalltalk.bye');
    manager.addDocument('en', 'goodbye', 'smalltalk.bye');
    manager.addDocument('en', 'who made you', 'smalltalk.creator');

    // Answers
    manager.addAnswer('en', 'greeting', 'Hello! I am your AI HR Assistant. I can help with leaves, policies, and your profile.');
    manager.addAnswer('en', 'greeting', 'Hi! How can I assist you with your HR needs today?');

    manager.addAnswer('en', 'policy.hours', 'Our general working hours are 9:00 AM to 6:00 PM, Monday to Friday.');
    manager.addAnswer('en', 'policy.dress', 'We follow a Business Casual dress code. Formal wear is recommended for client meetings.');
    manager.addAnswer('en', 'policy.holidays', 'The next upcoming holiday is Republic Day on January 26th. You can view the full calendar in the Dashboard.');
    manager.addAnswer('en', 'policy.benefits', 'You are covered under the company Medical Insurance up to $5000. PF contributions are matched at 12%.');

    manager.addAnswer('en', 'smalltalk.thanks', 'You\'re welcome! Let me know if you need anything else.');
    manager.addAnswer('en', 'smalltalk.bye', 'Goodbye! Have a productive day.');
    manager.addAnswer('en', 'smalltalk.creator', 'I was built by the NOVA Engineering Team to assist you.');

    await manager.train();
    manager.save();
    console.log('✅ AI Model Trained Successfully!');
};

// Train on startup
trainModel();

// Helper: Get user details
const getUserDetails = async (userId) => {
    return await User.findById(userId).select('-password');
};

// Helper: Parse Date "13th January 2026" -> "2026-01-13"
const parseDateString = (dayStr, monthStr, yearStr) => {
    try {
        const day = parseInt(dayStr);
        const monthNames = ["january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const month = monthNames.indexOf(monthStr.toLowerCase());
        if (month === -1) return null;

        const date = new Date(yearStr, month, day);
        // Format YYYY-MM-DD
        return date.toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
};

// Process Chat
exports.processChat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Process the message
        const response = await manager.process('en', message);
        console.log(`🤖 AI Debug | Msg: "${message}" | Intent: ${response.intent || 'None'} | Score: ${response.score} | GeminiKey: ${!!process.env.GEMINI_API_KEY}`);

        let reply = response.answer;
        let action = null;
        let data = {};

        // Custom Overrides/Heuristics for specific patterns the NLP might miss
        let intent = response.intent;
        if (message.toLowerCase().includes('from') && message.toLowerCase().includes('to') && /\d/.test(message)) {
            intent = 'leave.apply'; // Force leave intent for date ranges
        }

        // Handle Intents
        // Handle Intents
        if (intent === 'leave.balance') {
            const leaves = await Leave.find({ user: userId });
            const balances = { Sick: 7, Casual: 5, Earned: 15 }; // Mock balances
            leaves.forEach(l => {
                if (l.status === 'Approved' && balances[l.type]) balances[l.type] -= l.days;
            });
            reply = `You have ${balances.Sick} Sick leaves, ${balances.Casual} Casual leaves, and ${balances.Earned} Earned leaves remaining.`;
        }

        else if (intent === 'leave.status') {
            const latestLeave = await Leave.findOne({ user: userId }).sort({ createdAt: -1 });
            if (latestLeave) {
                reply = `Your latest ${latestLeave.type} application from ${latestLeave.startDate} to ${latestLeave.endDate} is currently **${latestLeave.status}**.`;
                if (latestLeave.adminComments) {
                    reply += ` (HR Note: ${latestLeave.adminComments})`;
                }
            } else {
                reply = "You haven't applied for any leaves yet.";
            }
        }

        else if (intent === 'employee.info') {
            const user = await getUserDetails(userId);
            reply = `You are ${user.name}, working as ${user.role}. Email: ${user.email}.`;
        }

        else if (intent === 'leave.apply') {
            // Attempt Entity Extraction

            // 1. Detect Leave Type
            let type = 'Sick'; // Default
            if (message.toLowerCase().includes('casual')) type = 'Casual';
            if (message.toLowerCase().includes('earned') || message.toLowerCase().includes('vacation')) type = 'Earned';
            if (message.toLowerCase().includes('house warming')) type = 'Casual'; // Contextual inference

            // 2. Extract Dates (Regex for "from 13th to 15th january 2026")
            const dateRangeRegex = /from\s+(\d{1,2}(?:st|nd|rd|th)?)\s+(?:to|-)\s+(\d{1,2}(?:st|nd|rd|th)?)\s+([a-zA-Z]+)\s+(\d{4})/i;
            const match = message.match(dateRangeRegex);

            if (match) {
                const startDay = match[1];
                const endDay = match[2];
                const month = match[3];
                const year = match[4];

                data.startDate = parseDateString(startDay, month, year);
                data.endDate = parseDateString(endDay, month, year);
            } else {
                // Relative Date Logic
                const msgLower = message.toLowerCase();
                if (msgLower.includes('tomorrow')) {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    data.startDate = tomorrow.toISOString().split('T')[0];
                    data.endDate = tomorrow.toISOString().split('T')[0];
                } else if (msgLower.includes('today')) {
                    const today = new Date();
                    data.startDate = today.toISOString().split('T')[0];
                    data.endDate = today.toISOString().split('T')[0];
                }
            }

            // 3. Extract Reason
            let reason = '';
            if (message.toLowerCase().includes('due to')) {
                reason = message.split(/due to/i)[1].trim();
            } else if (message.toLowerCase().includes('because of')) {
                reason = message.split(/because of/i)[1].trim();
            } else if (message.toLowerCase().includes('its')) {
                reason = message.split(/its/i)[1].trim();
            } else if (message.toLowerCase().includes('for')) {
                // Check if "for" is not part of "apply for"
                const parts = message.split(/for/i);
                if (parts.length > 1 && !parts[1].trim().startsWith('sick') && !parts[1].trim().startsWith('casual')) {
                    reason = parts[parts.length - 1].trim();
                }
            }
            // Clean up reason
            if (reason) reason = reason.replace(/my/i, 'Personal').replace(/house warming/i, 'House Warming Ceremony');

            data.type = type;
            data.reason = reason;

            if (data.startDate && data.endDate) {
                reply = `I've prepared your ${type} Leave application from ${data.startDate} to ${data.endDate} for "${reason || 'Personal Reason'}". Please review and submit.`;
                action = "OPEN_LEAVE_MODAL";
            } else {
                reply = "I can help with that. Please specify the dates (e.g., 'from 13th to 15th January 2026') and reason.";
                action = "OPEN_LEAVE_MODAL"; // Open empty modal as falback
            }
        }

        // Fallback or Gemini API
        if (!reply && !action) {
            // Check if Gemini API key is configured
            if (process.env.GEMINI_API_KEY) {
                try {
                    const { GoogleGenerativeAI } = require("@google/generative-ai");
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                    const prompt = `You are a helpful HR Assistant for NOVA Workforce. 
                    The user asked: "${message}". 
                    Answer politely and professionally. If it asks about company specifics not in your knowledge, politely defer to HR.
                    Keep the answer concise (under 50 words unless detailed explanation needed).`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    reply = response.text();
                } catch (apiError) {
                    console.error('Gemini API Error:', apiError);
                    reply = "I'm having trouble connecting to my knowledge base right now. Please try again later.";
                }
            } else {
                reply = "I'm not sure I understand. I can help with Leave Balances, Applying for Leave, HR Policies, or Profile Info. (Ask Admin to configure Gemini API for broader questions)";
            }
        }

        res.json({
            success: true,
            reply,
            intent: intent,
            action,
            data
        });

    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
};
