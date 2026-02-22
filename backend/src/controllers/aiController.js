const { NlpManager } = require('node-nlp');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ragService = require('../services/ragService');
const dbIntrospectionService = require('../services/dbIntrospectionService');

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], forceNER: true });

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

    // Intent: HR Specific (Organization Stats)
    manager.addDocument('en', 'how many employees are in our company', 'hr.employee_count');
    manager.addDocument('en', 'total headcount', 'hr.employee_count');
    manager.addDocument('en', 'who is on leave today', 'hr.on_leave');
    manager.addDocument('en', 'current active leaves', 'hr.on_leave');
    manager.addDocument('en', 'total payroll cost', 'hr.payroll_total');
    manager.addDocument('en', 'company monthly payroll', 'hr.payroll_total');
    manager.addDocument('en', 'how many job applications', 'hr.recruitment_stat');
    manager.addDocument('en', 'active recruitment status', 'hr.recruitment_stat');

    // Answers (Fallback/Core)
    manager.addAnswer('en', 'greeting', 'Hello! I am your AI HR Assistant. I can help with leaves, policies, and organizational insights.');
    manager.addAnswer('en', 'greeting', 'Hi! How can I assist you with your HR needs today?');

    manager.addAnswer('en', 'smalltalk.thanks', 'You\'re welcome! Let me know if you need anything else.');
    manager.addAnswer('en', 'smalltalk.bye', 'Goodbye! Have a productive day.');
    manager.addAnswer('en', 'smalltalk.creator', 'I was built by the NOVA Engineering Team to assist you.');

    await manager.train();
    manager.save();
    console.log('✅ AI Model Trained Successfully!');
};

// Train on startup
trainModel();

// Initialize RAG on startup (lazy indexing)
ragService.indexPolicies();

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
        const userRole = req.user.role;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. Core Data Retrieval
        const [user, employee, dbContext, hrStats, relevantPolicyChunks] = await Promise.all([
            User.findById(userId),
            Employee.findOne({ email: (await User.findById(userId)).email }),
            dbIntrospectionService.getUniversalContext(),
            dbIntrospectionService.getHRStats(),
            ragService.retrieveContext(message)
        ]);

        // 2. Intent Detection
        const nlpResponse = await manager.process('en', message);
        console.log(`🤖 Manual AI | Intent: ${nlpResponse.intent || 'None'} | Role: ${userRole}`);

        let action = null;
        let actionData = {};
        let reply = "";
        const intent = nlpResponse.intent;

        // 3. UI Action Handling (Modal triggers)
        if ((intent === 'leave.open_modal' || intent === 'leave.apply') && userRole !== 'hr') {
            action = "OPEN_LEAVE_MODAL";
        }

        // 4. MANUAL RESPONSE GENERATION (Rule-based)
        if (intent === 'hr.employee_count') {
            reply = `The organization currently has **${hrStats.employeeCount}** employees across all departments.`;
        } else if (intent === 'hr.recruitment_stat') {
            reply = `We have **${hrStats.activeJobs}** active job postings and **${hrStats.pendingApplications}** applications under review.`;
        } else if (intent === 'hr.payroll_total') {
            reply = `The total annual payroll liability is **$${hrStats.totalPayroll.toLocaleString()}**.`;
        } else if (intent === 'leave.balance' && userRole !== 'hr') {
            const sick = employee?.leaveBalances?.Sick || 12;
            const casual = employee?.leaveBalances?.Casual || 12;
            const earned = employee?.leaveBalances?.Earned || 10;
            reply = `Your current leave balances are:\n- **Sick Leave**: ${sick} days\n- **Casual Leave**: ${casual} days\n- **Earned Leave**: ${earned} days.`;
        } else if (message.toLowerCase().includes('total summary') || message.toLowerCase().includes('database overview')) {
            const overview = Object.entries(dbContext)
                .map(([name, info]) => `- **${name}**: ${info.count} documents (${info.fields.slice(0, 3).join(', ')}...)`)
                .join('\n');
            reply = `### Global Database Overview\n\nI have access to **${Object.keys(dbContext).length}** collections:\n\n${overview}`;
        } else if (relevantPolicyChunks.length > 0) {
            // Priority to RAG for policy questions
            const topChunk = relevantPolicyChunks[0];
            reply = `**Policy Information (${topChunk.source})**:\n\n${topChunk.text}\n\n*(Sourced from local policy records)*`;
        }

        // 5. Dynamic Collection Summarization (Fallback)
        if (!reply) {
            const modelNames = Object.keys(dbContext);
            const matchedModel = modelNames.find(name => message.toLowerCase().includes(name.toLowerCase()));

            if (matchedModel) {
                reply = await dbIntrospectionService.summarizeCollection(matchedModel);
                reply = `### ${matchedModel} Summary\n\n` + reply;
            }
        }

        // 6. Entity Search (Deep Search) fallback
        if (!reply) {
            const entities = await dbIntrospectionService.findEntityByName(message);
            if (entities.length > 0) {
                const entity = entities[0];
                const identifier = entity.data.name || entity.data.title || entity.data.fullName;
                reply = `I found a matching **${entity.type}** record: **${identifier}**.\n\n`;
                reply += "```json\n" + JSON.stringify(entity.data, (k, v) => k === 'password' ? '***' : v, 2).slice(0, 1000) + "\n```";
            }
        }

        // 7. Final Response Polishing
        if (!reply) {
            reply = "I'm sorry, I couldn't find specific information regarding that. I have access to all system data including Employees, Jobs, Payroll, and Policies. Try asking for a 'database overview'.";
        }

        if (action === "OPEN_LEAVE_MODAL") {
            reply = `I've opened the leave application form for you. ${reply}`;
        }

        res.json({
            success: true,
            reply,
            intent: intent,
            action,
            data: actionData
        });

    } catch (error) {
        console.error('Manual AI Processing Error:', error);
        res.status(500).json({ success: false, message: 'Local AI processing failed' });
    }
};
