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
    manager.addDocument('en', 'what is my role', 'employee.role');
    manager.addDocument('en', 'my designation', 'employee.role');
    manager.addDocument('en', 'who am i', 'employee.info');
    manager.addDocument('en', 'my profile', 'employee.info');
    manager.addDocument('en', 'show my profile', 'employee.info');
    manager.addDocument('en', 'profile', 'employee.info');
    manager.addDocument('en', 'my details', 'employee.info');
    manager.addDocument('en', 'tell me about myself', 'employee.info');

    manager.addDocument('en', 'what is my salary', 'employee.salary');
    manager.addDocument('en', 'how much do i earn', 'employee.salary');
    manager.addDocument('en', 'my package', 'employee.salary');
    manager.addDocument('en', 'my income', 'employee.salary');
    manager.addDocument('en', 'show my payslip', 'employee.salary');

    manager.addDocument('en', 'what is my project', 'employee.project');
    manager.addDocument('en', 'current project', 'employee.project');
    manager.addDocument('en', 'which team am i on', 'employee.project');

    manager.addDocument('en', 'joining date', 'employee.joinDate');
    manager.addDocument('en', 'when did i join', 'employee.joinDate');

    // Intent: Leave Handlers
    manager.addDocument('en', 'how to apply for leave', 'leave.howto');
    manager.addDocument('en', 'process for leave application', 'leave.howto');
    manager.addDocument('en', 'guide me to apply for leave', 'leave.howto');

    manager.addDocument('en', 'apply for leave now', 'leave.open_modal');
    manager.addDocument('en', 'i want to apply for leave', 'leave.open_modal');
    manager.addDocument('en', 'open leave form', 'leave.open_modal');

    // Intent: Response Yes
    manager.addDocument('en', 'yes', 'response.yes');
    manager.addDocument('en', 'yes please', 'response.yes');
    manager.addDocument('en', 'sure', 'response.yes');
    manager.addDocument('en', 'okay', 'response.yes');

    // Intent: Leave Apply (Shorthand)
    manager.addDocument('en', 'sick leave tomorrow', 'leave.apply');
    manager.addDocument('en', 'casual leave for monday', 'leave.apply');
    manager.addDocument('en', 'reason is fever', 'leave.apply');

    // Intent: Greetings
    manager.addDocument('en', 'hello', 'greeting');
    manager.addDocument('en', 'hi', 'greeting');
    manager.addDocument('en', 'hey', 'greeting');
    manager.addDocument('en', 'greetings', 'greeting');
    manager.addDocument('en', 'hi there', 'greeting');
    manager.addDocument('en', 'good morning', 'greeting');

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

        // Fetch User and Employee Data for Context
        const user = await User.findById(userId);
        const employee = await Employee.findOne({ email: user.email });

        // Process the message with NLP
        const response = await manager.process('en', message);
        console.log(`🤖 AI Debug | Msg: "${message}" | Intent: ${response.intent || 'None'} | Score: ${response.score}`);

        let reply = response.answer;
        let action = null;
        let data = {};
        const intent = response.intent;

        // --- HANDLERS FOR SPECIFIC INTENTS ---

        // 0. Greetings (Specific overrides)
        if (intent === 'greeting') {
            if (message.toLowerCase().trim() === 'hi') {
                reply = "Hi! How can I help you today?";
            } else if (message.toLowerCase().trim() === 'hello') {
                reply = "Hello! I am your HR Assistant. How can I assist you?";
            } else {
                reply = "Hello! How can I help?";
            }
        }

        // 1. Employee Details (Salary, Project, Role, etc.)
        else if (intent === 'employee.salary') {
            reply = employee && employee.salary
                ? `Your current salary is **${employee.salary}**.`
                : "I couldn't find your salary details. Please contact HR.";
        }
        else if (intent === 'employee.project') {
            reply = employee && employee.project
                ? `You are currently assigned to **${employee.project}**.`
                : "You are not currently assigned to any specific project.";
        }
        else if (intent === 'employee.role') {
            reply = employee && employee.position
                ? `Your current designation is **${employee.position}** (${employee.department}).`
                : `You are listed as **${user.role}**.`;
        }
        else if (intent === 'employee.joinDate') {
            reply = employee && employee.joiningDate
                ? `You joined NOVA on **${new Date(employee.joiningDate).toDateString()}**.`
                : "I don't have your joining date on record.";
        }
        else if (intent === 'employee.info') {
            // General Profile Summary
            if (employee) {
                reply = `**Profile Summary:**\n- Name: ${employee.name}\n- Role: ${employee.position}\n- Department: ${employee.department}\n- Project: ${employee.project || 'None'}`;
            } else {
                reply = `You are ${user.name}. Please update your profile for more details.`;
            }
        }

        // 2. Leave Guidance & Actions
        else if (intent === 'leave.howto') {
            reply = "To apply for leave:\n1. Go to the **Leave Management** section in the sidebar.\n2. Click the **'Apply for Leave'** button.\n3. Fill in the dates and reason.\n\n**Would you like me to open the form for you? (Say 'Yes please')**";
        }
        else if (intent === 'response.yes') {
            reply = "Okay! Please tell me details to fill the form:\n- **Type** (Sick/Casual)\n- **When** (e.g., Tomorrow)\n- **Reason**\n\n(Example: 'Sick leave tomorrow due to fever')";
        }
        else if (intent === 'leave.open_modal') {
            reply = "Sure, opening the **Leave Application Form** for you.";
            action = "OPEN_LEAVE_MODAL";
        }

        // 3. Leave Balances
        else if (intent === 'leave.balance') {
            // In a real app, fetch dynamic balances from a Balances collection
            // For now, calculating based on usage or static
            const leaves = await Leave.find({ user: userId });
            const balances = { Sick: 7, Casual: 5, Earned: 15 }; // Mock annual quota
            leaves.forEach(l => {
                if (l.status === 'Approved' && balances[l.type]) balances[l.type] -= l.days;
            });
            reply = `**Leave Balance:**\n- 🤒 Sick: ${balances.Sick}\n- 🌴 Casual: ${balances.Casual}\n- 💼 Earned: ${balances.Earned}`;
        }

        // 4. Leave Application Logic (Entity Extraction)
        else if (intent === 'leave.apply') {
            // Attempt Entity Extraction
            let type = 'Sick'; // Default
            if (message.toLowerCase().includes('casual')) type = 'Casual';
            if (message.toLowerCase().includes('earned') || message.toLowerCase().includes('vacation')) type = 'Earned';
            if (message.toLowerCase().includes('unpaid')) type = 'Unpaid';

            // Extract Dates
            const dateRangeRegex = /from\s+(\d{1,2}(?:st|nd|rd|th)?)\s+(?:to|-)\s+(\d{1,2}(?:st|nd|rd|th)?)\s+([a-zA-Z]+)\s+(\d{4})/i;
            const singleDateRegex = /(?:on|for)\s+(\d{1,2}(?:st|nd|rd|th)?)\s+([a-zA-Z]+)\s+(\d{4})/i;

            const rangeMatch = message.match(dateRangeRegex);
            const singleMatch = message.match(singleDateRegex);

            if (rangeMatch) {
                const startDay = rangeMatch[1];
                const endDay = rangeMatch[2];
                const month = rangeMatch[3];
                const year = rangeMatch[4];

                data.startDate = parseDateString(startDay, month, year);
                data.endDate = parseDateString(endDay, month, year);
            } else if (singleMatch) {
                const day = singleMatch[1];
                const month = singleMatch[2];
                const year = singleMatch[3];

                const date = parseDateString(day, month, year);
                data.startDate = date;
                data.endDate = date;
            } else {
                // Try relative dates
                const msgLower = message.toLowerCase();
                if (msgLower.includes('tomorrow')) {
                    const d = new Date(); d.setDate(d.getDate() + 1);
                    data.startDate = d.toISOString().split('T')[0];
                    data.endDate = d.toISOString().split('T')[0];
                } else if (msgLower.includes('today')) {
                    const d = new Date();
                    data.startDate = d.toISOString().split('T')[0];
                    data.endDate = d.toISOString().split('T')[0];
                }
            }

            // Reason Extraction (Simple heuristic)
            let reason = '';
            if (message.toLowerCase().includes('due to')) reason = message.split(/due to/i)[1].trim();
            else if (message.toLowerCase().includes('for')) {
                const parts = message.split(/for/i);
                if (parts.length > 1 && !['sick', 'casual', 'earned', 'leave'].some(k => parts[1].trim().startsWith(k))) {
                    reason = parts[parts.length - 1].trim();
                }
            }

            data.type = type;
            data.reason = reason;

            if (data.startDate) {
                reply = `I've opened the form and pre-filled your **${type} Leave** for **${data.startDate}**. Please check and submit.`;
            } else {
                reply = "I've opened the **Leave Application Form** for you. Please select the dates and reason.";
            }

            action = "OPEN_LEAVE_MODAL";
        }

        // 5. Fallback (No Intent Matched)
        if (!reply) {
            reply = "I'm trained to help with HR tasks. Ask me about your **Salary**, **Project**, **Leave Balance**, or say **'Apply for Leave'**.";
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
