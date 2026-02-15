const { NlpManager } = require('node-nlp');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ragService = require('../services/ragService');
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

        // 1. Fetch User and Employee Data for Context
        const user = await User.findById(userId);
        const employee = await Employee.findOne({ email: user.email });

        // 2. Load Organization Models for HR
        const JobApplication = require('../models/JobApplication');

        // 3. Retrieve Policy Context using RAG
        const relevantPolicyChunks = await ragService.retrieveContext(message);
        const policyContext = relevantPolicyChunks.map(c => `[Source: ${c.source}] ${c.text}`).join('\n\n');

        // 4. Process with NLP for Intent-based Actions
        const nlpResponse = await manager.process('en', message);
        console.log(`🤖 AI Debug | Intent: ${nlpResponse.intent || 'None'} | Role: ${userRole}`);

        let action = null;
        let data = {};
        const intent = nlpResponse.intent;

        // 5. Handle Specific Actions (Opening Modals, etc.)
        if ((intent === 'leave.open_modal' || intent === 'leave.apply') && userRole !== 'hr') {
            action = "OPEN_LEAVE_MODAL";
            if (intent === 'leave.apply') {
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
            }
        }

        // 6. Generate Local Response (Synthesize Context + Intent + Data)
        let reply = "";

        // Strategy A: If NLP has a direct answer, use it
        if (nlpResponse.answer) {
            reply = nlpResponse.answer;
        }

        // Strategy B: Role-based Logic
        if (userRole === 'hr') {
            if (intent === 'hr.employee_count') {
                const count = await Employee.countDocuments();
                reply = `The organization currently has **${count}** employees across all departments.`;
            } else if (intent === 'hr.on_leave') {
                const today = new Date().toISOString().split('T')[0];
                const activeLeaves = await Leave.find({
                    startDate: { $lte: today },
                    endDate: { $gte: today },
                    status: 'Approved'
                }).populate('employeeId');

                if (activeLeaves.length > 0) {
                    const names = activeLeaves.map(l => l.employeeId?.name || 'Unknown').join(', ');
                    reply = `Today, **${activeLeaves.length}** employees are on leave: ${names}.`;
                } else {
                    reply = "There are no employees on leave today.";
                }
            } else if (intent === 'hr.payroll_total') {
                const employees = await Employee.find();
                const total = employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
                reply = `The total annual payroll liability is **$${total.toLocaleString()}**.`;
            } else if (intent === 'hr.recruitment_stat') {
                const appsCount = await JobApplication.countDocuments();
                const pendingCount = await JobApplication.countDocuments({ status: 'under_review' });
                reply = `We have received a total of **${appsCount}** job applications, with **${pendingCount}** currently under review.`;
            }
        } else {
            // Employee specific Info
            if (intent === 'leave.balance') {
                const sick = employee?.leaveBalances?.Sick || 12;
                const casual = employee?.leaveBalances?.Casual || 12;
                const earned = employee?.leaveBalances?.Earned || 10;
                reply = `Your current leave balances are:\n- **Sick Leave**: ${sick} days\n- **Casual Leave**: ${casual} days\n- **Earned Leave**: ${earned} days.`;
            } else if (intent === 'employee.role') {
                reply = `You are currently working as a **${employee?.position || 'Employee'}** in the **${employee?.department || 'General'}** department.`;
            } else if (intent === 'employee.salary') {
                reply = `Your current annual salary is **${employee?.salary || 'not visible here'}**. You can view more details in the Salary section.`;
            } else if (intent === 'employee.project') {
                reply = `You are currently assigned to the project: **${employee?.project || 'Bench'}**.`;
            } else if (intent === 'employee.info') {
                reply = `Your profile name is **${user.name}**. You joined the company on **${employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'joining date not recorded'}**.`;
            }
        }

        // Strategy C: Context-based Policy Matching (If no specific reply yet)
        if (!reply || reply.toLowerCase().includes("i cannot find") || intent === 'None') {
            if (relevantPolicyChunks.length > 0) {
                const topChunk = relevantPolicyChunks[0];
                reply = `According to our **${topChunk.source}**:\n\n${topChunk.text}\n\n*(Information based on company records)*`;
            } else {
                reply = "I'm sorry, I couldn't find specific information regarding that in our current policies. Would you like to check the 'Policies' section or contact HR?";
            }
        }

        // Adjust for "Open Modal" actions
        if (action === "OPEN_LEAVE_MODAL") {
            reply = `I have opened the leave application form for you. ${reply}`;
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

