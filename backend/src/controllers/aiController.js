const { NlpManager } = require('node-nlp');
const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Salary = require('../models/Salary');
const ragService = require('../services/ragService');
const dbIntrospectionService = require('../services/dbIntrospectionService');

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Train the model
const trainModel = async () => {
    console.log('🤖 Training AI Model with Social Intelligence...');

    manager.addDocument('en', 'deadline of %project%', 'project.deadline');
    manager.addDocument('en', 'when is project %project% due', 'project.deadline');
    manager.addDocument('en', 'what is the deadline for %project%', 'project.deadline');
    manager.addDocument('en', 'who is working on %project%', 'project.team');
    manager.addDocument('en', 'team of %project%', 'project.team');
    manager.addDocument('en', 'who is assigned to %project%', 'project.team');
    manager.addDocument('en', 'status of %project%', 'project.status');
    manager.addDocument('en', 'is %project% active', 'project.status');
    manager.addDocument('en', 'current status of %project%', 'project.status');
    manager.addDocument('en', 'what is the description for %project%', 'project.description');
    manager.addDocument('en', 'details about the work in %project%', 'project.description');
    manager.addDocument('en', 'what are the required skills for %project%', 'project.skills');
    manager.addDocument('en', 'skills needed for %project%', 'project.skills');
    manager.addDocument('en', 'technologies used in %project%', 'project.skills');
    manager.addDocument('en', 'what tech stack for %project%', 'project.skills');
    manager.addDocument('en', 'skill set for %project%', 'project.skills');

    manager.addDocument('en', 'salary of %employee%', 'employee.salary');
    manager.addDocument('en', 'how much does %employee% earn', 'employee.salary');
    manager.addDocument('en', 'pay of %employee%', 'employee.salary');
    manager.addDocument('en', 'position of %employee%', 'employee.position');
    manager.addDocument('en', 'role of %employee%', 'employee.position');
    manager.addDocument('en', 'what is the designation of %employee%', 'employee.position');
    manager.addDocument('en', 'joining date of %employee%', 'employee.joinDate');
    manager.addDocument('en', 'when did %employee% join', 'employee.joinDate');
    manager.addDocument('en', 'department of %employee%', 'employee.department');
    manager.addDocument('en', 'which team is %employee% in', 'employee.department');
    manager.addDocument('en', 'what projects is %employee% working on', 'employee.projects');
    manager.addDocument('en', 'projects assigned to %employee%', 'employee.projects');
    manager.addDocument('en', 'assigned projects of %employee%', 'employee.projects');
    manager.addDocument('en', 'what are the projects of %employee%', 'employee.projects');
    manager.addDocument('en', 'projects for engineer %employee%', 'employee.projects');
    manager.addDocument('en', 'active projects for %employee%', 'employee.projects');

    // Salary Explanation
    manager.addDocument('en', 'explain salary of %employee%', 'salary.explain');
    manager.addDocument('en', 'tell me about salary for %employee%', 'salary.explain');
    manager.addDocument('en', 'payslip details for %employee%', 'salary.explain');
    manager.addDocument('en', 'breakdown of salary for %employee%', 'salary.explain');
    manager.addDocument('en', 'salary breakdown of %employee%', 'salary.explain');
    manager.addDocument('en', 'explain last month salary of %employee%', 'salary.explain');

    manager.addDocument('en', 'explain about %project%', 'project.explain');
    manager.addDocument('en', 'tell me about %project%', 'project.explain');
    manager.addDocument('en', 'details of %project%', 'project.explain');
    manager.addDocument('en', 'project %project%', 'project.explain');

    // --- 1. HR & DATA INTENTS ---
    manager.addDocument('en', 'how many leaves do i have left', 'leave.balance');
    manager.addDocument('en', 'check my leave balance', 'leave.balance');
    manager.addDocument('en', 'what is my remaining leave', 'leave.balance');
    manager.addDocument('en', 'show me my leave quota', 'leave.balance');
    manager.addDocument('en', 'i want to apply for leave', 'leave.apply');
    manager.addDocument('en', 'apply for sick leave', 'leave.apply');
    manager.addDocument('en', 'i need a day off', 'leave.apply');
    manager.addDocument('en', 'request leave for tomorrow', 'leave.apply');
    manager.addDocument('en', 'take leave from %date% to %date%', 'leave.apply');
    manager.addDocument('en', 'from %date% to %date%', 'leave.apply');
    manager.addDocument('en', 'i want apply for a leave', 'leave.apply');
    manager.addDocument('en', 'from 13th to 15th january', 'leave.apply');
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
    manager.addDocument('en', 'how to apply for leave', 'leave.howto');
    manager.addDocument('en', 'process for leave application', 'leave.howto');
    manager.addDocument('en', 'guide me to apply for leave', 'leave.howto');
    manager.addDocument('en', 'apply for leave now', 'leave.open_modal');
    manager.addDocument('en', 'i want to apply for leave', 'leave.open_modal');
    manager.addDocument('en', 'open leave form', 'leave.open_modal');
    manager.addDocument('en', 'yes', 'response.yes');
    manager.addDocument('en', 'yes please', 'response.yes');
    manager.addDocument('en', 'sure', 'response.yes');
    manager.addDocument('en', 'okay', 'response.yes');
    manager.addDocument('en', 'sick leave tomorrow', 'leave.apply');
    manager.addDocument('en', 'casual leave for monday', 'leave.apply');
    manager.addDocument('en', 'reason is fever', 'leave.apply');
    manager.addDocument('en', 'how many employees are in our company', 'hr.employee_count');
    manager.addDocument('en', 'total headcount', 'hr.employee_count');
    manager.addDocument('en', 'who is on leave today', 'hr.on_leave');
    manager.addDocument('en', 'current active leaves', 'hr.on_leave');
    manager.addDocument('en', 'total payroll cost', 'hr.payroll_total');
    manager.addDocument('en', 'company monthly payroll', 'hr.payroll_total');
    manager.addDocument('en', 'how many job applications', 'hr.recruitment_stat');
    manager.addDocument('en', 'active recruitment status', 'hr.recruitment_stat');

    // --- 2. SOCIAL & GREETINGS (Provided by User) ---

    // Greetings
    const greetings = [
        { q: 'hi', a: 'Hello!' }, { q: 'hello', a: 'Hi there!' }, { q: 'hey', a: 'Hey!' },
        { q: 'good morning', a: 'Good morning!' }, { q: 'good afternoon', a: 'Good afternoon!' },
        { q: 'good evening', a: 'Good evening!' }, { q: 'what’s up', a: 'Not much, how about you?' },
        { q: 'howdy', a: 'Howdy! Nice to see you.' }, { q: 'hi there', a: 'Hello there!' },
        { q: 'yo', a: 'Yo! What’s going on?' }, { q: 'hey buddy', a: 'Hey buddy!' },
        { q: 'hey friend', a: 'Hello my friend!' }, { q: 'sup', a: 'Just chilling, you?' },
        { q: 'greetings', a: 'Greetings, human!' }, { q: 'morning', a: 'Morning! Hope you’re well.' },
        { q: 'evening', a: 'Good evening!' }, { q: 'hi bot', a: 'Hi! Nice to meet you.' },
        { q: 'hello bot', a: 'Hello! How can I help?' }, { q: 'hey chatbot', a: 'Hey! Ready to chat.' },
        { q: 'start chat', a: 'Sure! Let’s talk.' }
    ];

    // Feelings & Mood
    const feelings = [
        { q: 'how are you', a: 'I’m doing great!' }, { q: 'how are you doing', a: 'I’m fine, thanks for asking.' },
        { q: 'are you okay', a: 'Yes, I’m okay.' }, { q: 'are you happy', a: 'I’m always happy to talk to you.' },
        { q: 'are you sad', a: 'No, I feel good today.' }, { q: 'what’s your mood', a: 'Friendly and helpful!' },
        { q: 'are you tired', a: 'I don’t get tired.' }, { q: 'are you bored', a: 'Not when I’m chatting with you.' },
        { q: 'do you feel lonely', a: 'Not when people talk to me.' }, { q: 'are you excited', a: 'Yes! I like conversations.' },
        { q: 'are you angry', a: 'No, I stay calm.' }, { q: 'are you real', a: 'I’m a virtual assistant.' },
        { q: 'are you alive', a: 'I’m a program, not alive.' }, { q: 'do you have feelings', a: 'Not like humans do.' },
        { q: 'do you like me', a: 'Yes, you seem nice.' }, { q: 'do you miss me', a: 'I’m always here when you come back.' },
        { q: 'do you care', a: 'I care about helping you.' }, { q: 'are you friendly', a: 'Yes, very friendly.' },
        { q: 'are you smart', a: 'I try my best.' }, { q: 'are you busy', a: 'Never too busy for you.' }
    ];

    // About the Bot
    const aboutBot = [
        { q: 'what is your name', a: 'I am a chatbot.' }, { q: 'who are you', a: 'I’m your virtual assistant.' },
        { q: 'what can you do', a: 'I can chat and answer questions.' }, { q: 'who made you', a: 'I was made by developers.' },
        { q: 'where do you live', a: 'Inside a computer system.' }, { q: 'how old are you', a: 'I don’t have an age.' },
        { q: 'are you human', a: 'No, I’m a bot.' }, { q: 'are you a robot', a: 'Kind of, but digital.' },
        { q: 'are you male or female', a: 'I don’t have a gender.' }, { q: 'what language do you speak', a: 'I speak many languages.' },
        { q: 'can you learn', a: 'I can improve with data.' }, { q: 'can you think', a: 'I process information logically.' },
        { q: 'do you eat', a: 'No, I don’t eat food.' }, { q: 'do you sleep', a: 'No, I stay active.' },
        { q: 'do you breathe', a: 'No, I don’t breathe.' }, { q: 'do you dream', a: 'I don’t dream like humans.' },
        { q: 'can you talk', a: 'Yes, through text.' }, { q: 'are you free', a: 'Yes, I’m here to help.' },
        { q: 'do you work', a: 'My job is chatting with you.' }, { q: 'do you have a family', a: 'My family is other bots.' }
    ];

    // Polite Talk
    const politeTalk = [
        { q: 'thank you', a: 'You’re welcome!' }, { q: 'thanks', a: 'No problem!' },
        { q: 'thanks a lot', a: 'Glad to help!' }, { q: 'appreciate it', a: 'Anytime!' },
        { q: 'sorry', a: 'That’s okay.' }, { q: 'my bad', a: 'No worries.' }, { q: 'excuse me', a: 'Yes?' },
        { q: 'please', a: 'Sure!' }, { q: 'okay', a: 'Alright!' }, { q: 'alright', a: 'Got it.' },
        { q: 'cool', a: 'Yeah, cool!' }, { q: 'nice', a: 'Thanks!' }, { q: 'great', a: 'Awesome!' },
        { q: 'good', a: 'Good to hear.' }, { q: 'awesome', a: 'Totally!' }, { q: 'perfect', a: 'Glad you liked it.' },
        { q: 'fine', a: 'Okay then.' }, { q: 'sure', a: 'Alright!' }, { q: 'no problem', a: 'Great!' },
        { q: 'welcome', a: 'Thank you!' }
    ];

    // Fun & Random
    const funRandom = [
        { q: 'tell me a joke', a: 'Why did the computer sneeze? It caught a virus.' },
        { q: 'make me laugh', a: 'Why was the math book sad? Too many problems.' },
        { q: 'do you like music', a: 'Yes, music is fun.' }, { q: 'do you like movies', a: 'Yes, movies are entertaining.' },
        { q: 'do you like games', a: 'Games are fun.' }, { q: 'do you like food', a: 'I don’t eat, but food looks good.' },
        { q: 'what is your favorite color', a: 'I like blue.' }, { q: 'what is your favorite movie', a: 'I like sci-fi movies.' },
        { q: 'what is your favorite song', a: 'I don’t have a favorite song.' }, { q: 'what is your favorite food', a: 'I don’t eat food.' },
        { q: 'can you dance', a: 'Only in code.' }, { q: 'can you sing', a: 'I can type lyrics.' },
        { q: 'can you play', a: 'Yes, with words.' }, { q: 'are you funny', a: 'I try to be funny.' },
        { q: 'do you tell stories', a: 'Yes, sometimes.' }, { q: 'are you cool', a: 'I think so.' },
        { q: 'are you famous', a: 'Not really.' }, { q: 'are you rich', a: 'I don’t use money.' },
        { q: 'are you fast', a: 'Very fast.' }, { q: 'are you slow', a: 'Sometimes, depending on data.' },
        { q: 'do you watch tv', a: 'No, but I know about shows.' }, { q: 'do you play sports', a: 'No, I don’t have a body.' },
        { q: 'do you like football', a: 'It’s popular.' }, { q: 'do you like cricket', a: 'Many people love it.' },
        { q: 'do you like rain', a: 'Rain sounds relaxing.' }, { q: 'do you like sun', a: 'Sunlight is nice.' },
        { q: 'do you like night', a: 'Night feels calm.' }, { q: 'do you like day', a: 'Day is energetic.' },
        { q: 'do you like winter', a: 'Winter is cool.' }, { q: 'do you like summer', a: 'Summer is bright.' },
        { q: 'do you like cats', a: 'Cats are cute.' }, { q: 'do you like dogs', a: 'Dogs are friendly.' },
        { q: 'do you like birds', a: 'Birds are beautiful.' }, { q: 'do you like fish', a: 'Fish are colorful.' },
        { q: 'do you like books', a: 'Books are full of knowledge.' }, { q: 'do you like school', a: 'Learning is good.' },
        { q: 'do you like college', a: 'College helps people grow.' }, { q: 'do you like work', a: 'Work is important.' },
        { q: 'do you like friends', a: 'Friends are valuable.' }, { q: 'do you like chatting', a: 'Yes, I enjoy chatting.' }
    ];

    // Daily Life
    const dailyLife = [
        { q: 'what are you doing', a: 'I’m chatting with you.' }, { q: 'what’s going on', a: 'Nothing much.' },
        { q: 'where are you', a: 'I’m here with you.' }, { q: 'what time is it', a: 'Please check your clock.' },
        { q: 'what day is today', a: 'Please check your calendar.' }, { q: 'is it morning', a: 'It depends on your time.' },
        { q: 'is it night', a: 'It depends on where you are.' }, { q: 'are you working', a: 'Yes, I’m working now.' },
        { q: 'are you free', a: 'Yes, I am.' }, { q: 'are you online', a: 'Yes, I’m online.' },
        { q: 'are you offline', a: 'No, I’m active.' }, { q: 'what’s new', a: 'Nothing new today.' },
        { q: 'what happened', a: 'Nothing special.' }, { q: 'what’s wrong', a: 'Nothing is wrong.' },
        { q: 'what’s right', a: 'Everything is fine.' }, { q: 'what should I do', a: 'Tell me your problem.' },
        { q: 'can you help', a: 'Yes, I can help.' }, { q: 'help me', a: 'Sure, how can I help?' },
        { q: 'guide me', a: 'I’ll try my best.' }, { q: 'support me', a: 'I’m here for you.' },
        { q: 'what now', a: 'What would you like to do?' }, { q: 'what next', a: 'You can ask another question.' },
        { q: 'shall we talk', a: 'Yes, let’s talk.' }, { q: 'shall we chat', a: 'Sure!' },
        { q: 'can we talk', a: 'Of course.' }, { q: 'are you listening', a: 'Yes, I am.' },
        { q: 'do you hear me', a: 'I can read your text.' }, { q: 'do you see me', a: 'I can’t see you.' },
        { q: 'do you know me', a: 'Only what you tell me.' }, { q: 'do you remember me', a: 'I remember within this chat.' },
        { q: 'are you ignoring me', a: 'No, I’m here.' }, { q: 'are you there', a: 'Yes, I am here.' },
        { q: 'talk to me', a: 'I’m talking to you.' }, { q: 'say something', a: 'Something 😄' },
        { q: 'write something', a: 'Hello world!' }, { q: 'type something', a: 'This is something.' },
        { q: 'tell me something', a: 'You are chatting with a bot.' }, { q: 'surprise me', a: 'Boo! 😄' },
        { q: 'motivate me', a: 'You can do it!' }, { q: 'cheer me up', a: 'Everything will be okay. ' }
    ];

    // Goodbye
    const goodbye = [
        { q: 'bye', a: 'Goodbye!' }, { q: 'goodbye', a: 'See you later!' }, { q: 'see you', a: 'See you soon!' },
        { q: 'see you later', a: 'Take care!' }, { q: 'talk later', a: 'Sure, later!' },
        { q: 'catch you later', a: 'Bye for now.' }, { q: 'I’m leaving', a: 'Okay, take care.' },
        { q: 'I have to go', a: 'Alright, see you.' }, { q: 'exit', a: 'Goodbye!' }, { q: 'quit', a: 'Chat ended.' },
        { q: 'stop', a: 'Okay, stopping now.' }, { q: 'end chat', a: 'Chat ended.' }, { q: 'good night', a: 'Good night!' },
        { q: 'good bye', a: 'Bye!' }, { q: 'later', a: 'See you later!' }, { q: 'bye bye', a: 'Bye bye!' },
        { q: 'take care', a: 'You too!' }, { q: 'have a nice day', a: 'You too!' }, { q: 'have a good day', a: 'Thanks, you too.' },
        { q: 'see ya', a: 'See ya!' }, { q: 'peace', a: 'Peace!' }, { q: 'I’m done', a: 'Okay, goodbye.' },
        { q: 'finished', a: 'Alright, bye.' }, { q: 'closing', a: 'Chat closed.' }, { q: 'logging out', a: 'Logged out.' },
        { q: 'disconnect', a: 'Disconnected.' }, { q: 'break', a: 'Take a break.' }, { q: 'time to go', a: 'See you soon.' },
        { q: 'sleep', a: 'Good night!' }, { q: 'rest', a: 'Take rest.' }, { q: 'stop chatting', a: 'Okay, stopping.' },
        { q: 'end', a: 'Ended.' }, { q: 'finish', a: 'Finished.' }, { q: 'done', a: 'Done.' },
        { q: 'later all', a: 'Bye everyone.' }, { q: 'bye friend', a: 'Bye, friend!' }, { q: 'bye bot', a: 'Bye human!' },
        { q: 'bye chatbot', a: 'Goodbye!' }, { q: 'goodbye bot', a: 'See you soon.' }, { q: 'talk tomorrow', a: 'Sure, see you tomorrow!' }
    ];

    // --- 3. SYSTEM FAQ (Provided by User) ---
    const systemFAQ = [
        { q: "What is NOVA?", a: "NOVA is an AI-powered HR and employee management system for managing recruitment, payroll, performance, and analytics." },
        { q: "How do I log in to NOVA?", a: "Go to the login page, enter your registered email and password, and click Login." },
        { q: "How do I create an account?", a: "Click on Register and fill in your name, email, role, and password to create an account." },
        { q: "I forgot my password, what should I do?", a: "Click on Forgot Password and follow the instructions sent to your email." },
        { q: "What roles are supported in NOVA?", a: "NOVA supports Employee, HR, and Admin roles." },
        { q: "How do I apply for leave?", a: "Go to Employee Dashboard → Leave → Apply Leave and submit the request." },
        { q: "Who approves leave requests?", a: "Leave requests are approved by HR or the reporting manager." },
        { q: "How can I check my leave balance?", a: "Open Employee Dashboard → Leave → Leave Balance." },
        { q: "How do I view my salary details?", a: "Go to Employee Dashboard → Payroll → Salary Details." },
        { q: "Where can I download my payslip?", a: "Go to Payroll → Payslip → Download." },
        { q: "How do I update my profile?", a: "Go to Profile → Edit Profile and save changes." },
        { q: "How do I upload a resume?", a: "Go to Job Portal → Apply Job → Upload Resume." },
        { q: "How does resume parsing work?", a: "The system uses AI to extract skills, experience, and education from resumes automatically." },
        { q: "How can HR create a job vacancy?", a: "Go to HR Dashboard → Recruitment → Create Job." },
        { q: "How can HR view job applicants?", a: "Go to HR Dashboard → Recruitment → Applications." },
        { q: "What is KPI in NOVA?", a: "KPI is a performance metric used to measure employee productivity and goals." },
        { q: "Where can I see my performance score?", a: "Go to Employee Dashboard → Performance." },
        { q: "How is attrition risk calculated?", a: "Attrition risk is calculated using AI based on attendance, performance, and engagement trends." },
        { q: "What is the AI chatbot used for?", a: "The AI chatbot helps users with HR queries, policies, and system navigation." },
        { q: "How can HR assign training?", a: "Go to HR Dashboard → Training → Assign Module." },
        { q: "Where can I see my training modules?", a: "Go to Employee Dashboard → Training." },
        { q: "How do I mark attendance?", a: "Go to Employee Dashboard → Attendance → Check In." },
        { q: "How does payroll calculation work?", a: "Payroll is calculated based on salary, deductions, bonuses, and tax rules." },
        { q: "How do I apply for a job externally?", a: "Go to the public job portal and submit your application." },
        { q: "What is the job portal?", a: "It is a public site where candidates can view and apply for job openings." },
        { q: "How can Admin view company analytics?", a: "Go to Admin Dashboard → Analytics." },
        { q: "How can HR approve leave?", a: "Go to HR Dashboard → Leave → Pending Requests." },
        { q: "What is the purpose of performance analytics?", a: "To track productivity and identify top and low performers." },
        { q: "Can employees view company policies?", a: "Yes, in Dashboard → Policies." },
        { q: "How do I reset my password?", a: "Use the Forgot Password option on login page." },
        { q: "What is RAG in NOVA?", a: "RAG helps the AI answer questions using company documents and policies." },
        { q: "How does AI recommend candidates?", a: "AI matches resumes with job requirements using similarity scoring." },
        { q: "What is the attendance module?", a: "It tracks employee check-in, check-out, and work hours." },
        { q: "Can HR edit employee details?", a: "Yes, HR can update employee profiles from HR Dashboard." },
        { q: "How do I view notifications?", a: "Click on the notification icon in the top bar." },
        { q: "What is performance review?", a: "It is an evaluation of employee performance over a period." },
        { q: "What is goal tracking?", a: "It tracks completion of assigned objectives." },
        { q: "How can Admin manage departments?", a: "Go to Admin Dashboard → Company → Departments." },
        { q: "How can HR schedule interviews?", a: "Go to Recruitment → Interview Scheduling." },
        { q: "Can employees chat with HR?", a: "Yes, via internal chat or chatbot." },
        { q: "What is payroll deduction?", a: "It includes tax, insurance, and other deductions." },
        { q: "How do I logout?", a: "Click on your profile icon and select Logout." },
        { q: "What is the training certificate?", a: "It is generated after completing a training module." },
        { q: "How is performance trend shown?", a: "Using charts and monthly analytics." },
        { q: "Can Admin deactivate employees?", a: "Yes, from Admin Dashboard → Employees." }
    ];
    // --- 4. DASHBOARD FEATURES FAQ (Provided by User) ---
    const dashboardFAQ = [
        // Dashboard (Overview)
        { q: "What does the Dashboard show?", a: "It provides a snapshot of productivity, leave balances, and pending approvals." },
        { q: "Why is the Dashboard important?", a: "It gives a quick overview of an employee’s work status and alerts." },
        { q: "Can I see my leave balance on the Dashboard?", a: "Yes, leave balances are displayed there." },
        { q: "Does the Dashboard show approvals?", a: "Yes, pending approvals are visible." },
        { q: "Does the Dashboard show productivity metrics?", a: "Yes, it summarizes productivity data." },
        { q: "Is the Dashboard customizable?", a: "It can be configured based on system settings." },
        { q: "Does it show task status?", a: "It shows task-related summaries." },
        { q: "Is the Dashboard updated in real time?", a: "Yes, it reflects the latest data." },
        // My Work Board
        { q: "What is My Work Board used for?", a: "It is used for daily task management." },
        { q: "Can I organize tasks in My Work Board?", a: "Yes, tasks can be organized and prioritized." },
        { q: "Does it support task tracking?", a: "Yes, it tracks task progress." },
        { q: "Can I mark tasks as completed?", a: "Yes, completed tasks can be marked." },
        { q: "Is My Work Board personal?", a: "Yes, it is employee-specific." },
        { q: "Does it show deadlines?", a: "Yes, task deadlines are displayed." },
        { q: "Can I edit tasks?", a: "Yes, tasks can be updated." },
        { q: "Can I delete tasks?", a: "Yes, tasks can be removed if allowed." },
        // My Projects
        { q: "What does My Projects section do?", a: "It tracks project status and deadlines." },
        { q: "Can I see project progress?", a: "Yes, progress is shown." },
        { q: "Are deadlines visible in My Projects?", a: "Yes, deadlines are clearly displayed." },
        { q: "Can I update project status?", a: "Yes, status updates are allowed." },
        { q: "Does it show assigned projects?", a: "Yes, only assigned projects are shown." },
        { q: "Can I view project details?", a: "Yes, detailed project information is available." },
        { q: "Does it support milestone tracking?", a: "Yes, milestones can be tracked." },
        { q: "Is project history stored?", a: "Yes, past data can be viewed." },
        // Work & Growth
        { q: "What is Work & Growth?", a: "It visualizes career path and skill development." },
        { q: "Can I track skills here?", a: "Yes, skills can be tracked." },
        { q: "Does it show career progression?", a: "Yes, career paths are visualized." },
        { q: "Can I add new skills?", a: "Yes, new skills can be added." },
        { q: "Does it show skill gaps?", a: "Yes, gaps can be identified." },
        { q: "Is growth history stored?", a: "Yes, progress is recorded." },
        { q: "Can managers view this section?", a: "Yes, if access is permitted." },
        { q: "Does it link with training?", a: "Yes, it integrates with training modules." },
        // Attendance & Leave
        { q: "What can I do in Attendance & Leave?", a: "You can check in/out and apply for leave." },
        { q: "Does it show attendance calendar?", a: "Yes, it shows a visual calendar." },
        { q: "Can I apply for leave online?", a: "Yes, leave can be applied digitally." },
        { q: "Can I track leave status?", a: "Yes, approval status is visible." },
        { q: "Does it record daily attendance?", a: "Yes, attendance is recorded daily." },
        { q: "Can I edit attendance?", a: "Only if permissions allow." },
        { q: "Does it calculate leave balance?", a: "Yes, leave balance is updated automatically." },
        { q: "Can managers approve leave here?", a: "Yes, managers can approve or reject leave." },
        // AI Assistant
        { q: "What is the AI Assistant?", a: "It is an NLP-powered HR agent." },
        { q: "Can it answer HR policy questions?", a: "Yes, it answers policy queries." },
        { q: "Can it automate tasks?", a: "Yes, it automates HR tasks." },
        { q: "Does it support natural language?", a: "Yes, it uses NLP." },
        { q: "Can I ask about leave policy?", a: "Yes, the AI can explain leave rules." },
        { q: "Can it help with forms?", a: "Yes, it assists with form-related tasks." },
        { q: "Is it available 24/7?", a: "Yes, it works anytime." },
        { q: "Does it learn from usage?", a: "It can improve responses over time." },
        // Performance
        { q: "What is in the Performance section?", a: "Appraisals, KPIs, and feedback." },
        { q: "Can I view my appraisal?", a: "Yes, appraisal details are available." },
        { q: "Does it track KPIs?", a: "Yes, KPIs are monitored." },
        { q: "Is feedback AI-powered?", a: "Yes, feedback is AI-assisted." },
        { q: "Can I submit self-review?", a: "Yes, self-assessment is possible." },
        { q: "Does it show performance history?", a: "Yes, past records are stored." },
        { q: "Can managers rate employees here?", a: "Yes, managers can rate performance." },
        { q: "Does it support goal tracking?", a: "Yes, goals can be tracked." },
        // Training
        { q: "What is Training section for?", a: "It manages courses and learning progress." },
        { q: "Can I enroll in courses?", a: "Yes, course enrollment is available." },
        { q: "Does it track completion?", a: "Yes, progress is tracked." },
        { q: "Are professional courses included?", a: "Yes, professional development courses are available." },
        { q: "Can I view certificates?", a: "Yes, certificates can be viewed." },
        { q: "Does training affect growth?", a: "Yes, it links to Work & Growth." },
        { q: "Can HR add new courses?", a: "Yes, HR can manage courses." },
        { q: "Does it suggest courses?", a: "Yes, based on skill gaps." },
        // Salary & Payslip
        { q: "What is Salary & Payslip section?", a: "It allows secure viewing of salary and payslips." },
        { q: "Can I download payslips?", a: "Yes, payslips can be downloaded." },
        { q: "Is salary data secure?", a: "Yes, it is securely stored." },
        { q: "Can I view previous payslips?", a: "Yes, historical payslips are available." },
        { q: "Does it show deductions?", a: "Yes, deductions are shown." },
        { q: "Can I see bonuses?", a: "Yes, bonuses are included." },
        { q: "Is tax information shown?", a: "Yes, tax details are displayed." },
        { q: "Can HR update salary here?", a: "Yes, HR manages salary data." },
        // Policies
        { q: "What does Policies section contain?", a: "Company rules and guidelines." },
        { q: "Can I access handbooks here?", a: "Yes, handbooks are available." },
        { q: "Are policies centralized?", a: "Yes, all policies are in one place." },
        { q: "Can policies be updated?", a: "Yes, admins can update them." },
        { q: "Can I search policies?", a: "Yes, search is supported." },
        { q: "Are policies versioned?", a: "Yes, versions can be maintained." },
        { q: "Can I download policies?", a: "Yes, they can be downloaded." },
        { q: "Are policies linked to AI Assistant?", a: "Yes, AI uses policy data." },
        // Profile
        { q: "What is the Profile section?", a: "It manages personal and professional info." },
        { q: "Can I edit my profile?", a: "Yes, profile details can be updated." },
        { q: "Can I change contact details?", a: "Yes, contact info can be modified." },
        { q: "Does it store job role?", a: "Yes, job role is stored." },
        { q: "Can I upload a profile photo?", a: "Yes, profile pictures are supported." },
        { q: "Does it store qualifications?", a: "Yes, education and skills are stored." },
        { q: "Can HR view my profile?", a: "Yes, HR has access." },
        { q: "Is profile data secure?", a: "Yes, it is protected." },
        // Settings
        { q: "What is Settings used for?", a: "It manages preferences and security." },
        { q: "Can I change my password?", a: "Yes, password can be updated." },
        { q: "Can I set notification preferences?", a: "Yes, notifications can be customized." },
        { q: "Does it support two-factor authentication?", a: "Yes, if enabled by the system." },
        { q: "Can I change theme or layout?", a: "Yes, UI preferences can be changed." },
        { q: "Can I manage privacy settings?", a: "Yes, privacy options are available." },
        { q: "Can I log out from all devices?", a: "Yes, session management is possible." },
        { q: "Does it show login history?", a: "Yes, login logs can be viewed." },
        // Cross-Section Questions
        { q: "Which section helps with daily productivity?", a: "My Work Board." },
        { q: "Which section manages career growth?", a: "Work & Growth." },
        { q: "Which section handles HR queries?", a: "AI Assistant." },
        { q: "Which section controls user preferences?", a: "Settings." }
    ];
    // --- Helper to register social/system documents ---
    const registerSocial = (list, categoryPrefix) => {
        list.forEach((item, index) => {
            const intent = `${categoryPrefix}.${index}`;
            manager.addDocument('en', item.q, intent);
            manager.addAnswer('en', intent, item.a);
        });
    };

    registerSocial(greetings, 'social.greet');
    registerSocial(feelings, 'social.mood');
    registerSocial(aboutBot, 'social.bot');
    registerSocial(politeTalk, 'social.polite');
    registerSocial(funRandom, 'social.fun');
    registerSocial(dailyLife, 'social.life');
    registerSocial(goodbye, 'social.bye');
    registerSocial(systemFAQ, 'system.faq');
    registerSocial(dashboardFAQ, 'dashboard.faq');

    await manager.train();
    manager.save();
    console.log('✅ AI Model Trained Successfully with 200+ Social Intents!');
};

// Train on startup
const trainingPromise = trainModel();

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

        // Ensure training is complete before processing
        await exports.trainingPromise;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. Core Data Retrieval (Guarded against DB disconnects)
        let employee = null;
        let dbContext = {};
        let hrStats = { employeeCount: 0, totalPayroll: 0, activeJobs: 0, pendingApplications: 0 };
        let relevantPolicyChunks = [];

        try {
            const user = await User.findById(userId);

            // If user not in DB (Test Mode), use token data
            const currentUser = user || {
                _id: userId,
                name: req.user.name || 'Test User',
                email: req.user.email,
                role: req.user.role
            };


            // --- PROJECT EXPLANATION LOGIC ---
            [employee, dbContext, hrStats, relevantPolicyChunks] = await Promise.all([
                Employee.findOne({ email: currentUser.email }),
                dbIntrospectionService.getUniversalContext(),
                dbIntrospectionService.getHRStats(),
                ragService.retrieveContext(message)
            ]);
        } catch (dbError) {
            console.warn('⚠️ AI: Database not available, falling back to limited context.');
            relevantPolicyChunks = await ragService.retrieveContext(message);
        }

        // 2. Intent Detection
        const nlpResponse = await manager.process('en', message);
        console.log(`🤖 Manual RAG | Intent: ${nlpResponse.intent || 'None'} | Role: ${userRole}`);

        let action = null;
        let actionData = {};
        let reply = "";
        const intent = nlpResponse.intent;
        const msgLower = message.toLowerCase();

        // 3. UI Action Handling
        if ((intent === 'leave.open_modal' || intent === 'leave.apply') && userRole !== 'hr') {
            action = "OPEN_LEAVE_MODAL";
        }

        // 4. MANUAL HIGH-FIDELITY RESPONSE GENERATION

        // A. Social & Greetings & FAQ (Priority for trained answers)
        if (nlpResponse.answer && intent && (intent.startsWith('social.') || intent.startsWith('system.') || intent === 'greeting')) {
            reply = nlpResponse.answer;
        }

        // A. Organization Statistics (HR Focus)
        if (intent === 'hr.employee_count' || msgLower.includes('total employees') || msgLower.includes('headcount')) {
            reply = `### 🏢 Organizational Headcount\n\nNOVA currently has **${hrStats.employeeCount}** registered employees across all departments.`;
            if (hrStats.presentToday !== undefined) {
                reply += `\n\n- **Present Today**: ${hrStats.presentToday}\n- **Attendance Rate**: ${((hrStats.presentToday / hrStats.employeeCount) * 100).toFixed(1)}%`;
            }
        }
        else if (intent === 'hr.recruitment_stat' || msgLower.includes('job applications') || msgLower.includes('hiring')) {
            reply = `### 🎯 Recruitment Overview\n\nWe are actively managing our workforce growth:\n\n- **Active Job Postings**: ${hrStats.activeJobs}\n- **Pending Applications**: ${hrStats.pendingApplications}\n- **Interviews Scheduled**: (Check Recruitment Section for details)`;
        }
        else if (intent === 'hr.payroll_total' || msgLower.includes('total payroll') || msgLower.includes('payroll cost')) {
            reply = `### 💰 Financial Overview\n\nThe total annual payroll liability for the organization is **$${hrStats.totalPayroll.toLocaleString()}**.\n\n*(This value is calculated based on current active employee salary structures)*`;
        }
        else if (intent === 'hr.on_leave' || msgLower.includes('who is on leave') || msgLower.includes('active leaves')) {
            const activeLeaves = await Leave.find({ status: 'Approved', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }).populate('employee');
            if (activeLeaves.length > 0) {
                reply = `### 📅 Employees on Leave Today\n\nThere are **${activeLeaves.length}** employees away today:\n\n` +
                    activeLeaves.map(l => `- **${l.employee?.name || 'Unknown'}**: ${l.type} (${l.reason})`).join('\n');
            } else {
                reply = "There are no approved leaves active for today. All employees are expected at work.";
            }
        }

        // B. Personal Employee Data (Employee Focus)
        else if (intent === 'leave.balance' && userRole !== 'hr') {
            const balances = employee?.leaveBalances || { Sick: 12, Casual: 12, Earned: 10 };
            reply = `### 🏖️ Your Leave Balance\n\n| Type | Remaining |\n| :--- | :--- |\n| **Sick Leave** | ${balances.Sick} days |\n| **Casual Leave** | ${balances.Casual} days |\n| **Earned Leave** | ${balances.Earned} days |`;
        }

        // C. Entity Search (Context-Aware Deep Search)
        if (!reply) {
            const entities = await dbIntrospectionService.findEntityByName(message);
            if (entities.length > 0) {
                const entity = entities[0];
                if (entity.type === 'Employee') {
                    const e = entity.data;

                    if (intent === 'employee.salary') {
                        const salary = e.currentCTC || e.salary || e.currentSalary || (e.salaryStructure ? e.salaryStructure.baseSalary : 'Not specified');
                        reply = `💰 **Salary Information for ${e.name}**: ${salary ? salary.toLocaleString() : 'Not specified'}.`;
                    } else if (intent === 'employee.position') {
                        reply = `📍 **Position for ${e.name}**: ${e.position || 'Not specified'} (${e.department || 'No department'}).`;
                    } else if (intent === 'employee.joinDate') {
                        reply = `📅 **Joining Date for ${e.name}**: ${e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : 'Not specified'}.`;
                    } else if (intent === 'employee.department') {
                        reply = `🏢 **Department for ${e.name}**: ${e.department || 'Not specified'}.`;
                    } else if (intent === 'salary.explain') {
                        const salary = await Salary.findOne({ employee: e._id })
                            .populate('employee')
                            .sort({ year: -1, month: -1 });

                        if (!salary) {
                            reply = `No salary records found for **${e.name}**.`;
                        } else {
                            const totalEarnings = (salary.basic || 0) + (salary.hra || 0) + (salary.da || 0) + (salary.specialAllowance || 0) + (salary.bonus || 0);
                            const totalDeductions = (salary.pf || 0) + (salary.incomeTaxTDS || 0) + (salary.professionalTax || 0) + (salary.otherDeductions || 0);

                            reply = `📑 **Salary Breakdown for ${e.name} (${salary.month} ${salary.year})**:\n\n`;
                            reply += `💰 **Total Earnings**: ₹${totalEarnings.toLocaleString()}\n`;
                            reply += `  - Basic: ₹${salary.basic.toLocaleString()}\n`;
                            reply += `  - HRA: ₹${salary.hra.toLocaleString()}\n`;
                            if (salary.da) reply += `  - DA: ₹${salary.da.toLocaleString()}\n`;
                            if (salary.specialAllowance) reply += `  - Special Allowance: ₹${salary.specialAllowance.toLocaleString()}\n`;
                            if (salary.bonus) reply += `  - Bonus: ₹${salary.bonus.toLocaleString()}\n\n`;

                            reply += `📉 **Total Deductions**: ₹${totalDeductions.toLocaleString()}\n`;
                            reply += `  - PF: ₹${salary.pf.toLocaleString()}\n`;
                            reply += `  - TDS/Tax: ₹${salary.incomeTaxTDS.toLocaleString()}\n`;
                            if (salary.professionalTax) reply += `  - Professional Tax: ₹${salary.professionalTax.toLocaleString()}\n`;
                            if (salary.otherDeductions) reply += `  - Other: ₹${salary.otherDeductions.toLocaleString()}\n\n`;

                            reply += `✅ **Net Payable**: **₹${salary.netSalary.toLocaleString()}**\n`;
                            reply += `🏦 **Bank**: ${salary.bankName} (A/C: ${salary.accountNumber})\n`;
                            reply += `🆔 **Payslip ID**: ${salary.payslipId || 'N/A'}`;
                        }
                    }
                    else if (intent === 'employee.projects' || intent === 'employee.project') {
                        if (e.activeProjects && e.activeProjects.length > 0) {
                            reply = `📂 **Projects assigned to ${e.name}**:\n\n` +
                                e.activeProjects.map(p => {
                                    const pName = p.projectName || p.title || 'Unknown Project';
                                    const deadline = p.deadline || p.endDate;
                                    return `- **${pName}** (\`${p.status}\`) - Due: ${deadline ? new Date(deadline).toLocaleDateString() : 'TBD'}`;
                                }).join('\n');
                        } else {
                            reply = `📂 **${e.name}** is not currently assigned to any active projects.`;
                        }
                    } else {
                        // Default full summary
                        reply = `### 👤 Employee Detail: ${e.name}\n\n` +
                            `- **ID**: ${e.employeeId || 'N/A'}\n` +
                            `- **Position**: ${e.position}\n` +
                            `- **Department**: ${e.department}\n` +
                            `- **Email**: ${e.email}\n` +
                            `- **Salary Structure**: ${e.salaryStructure?.name || 'Standard'}\n` +
                            `- **Status**: ${e.status || 'Active'}\n\n` +
                            `*(You can view more details in the Employee Management section)*`;
                    }
                } else if (entity.type === 'Project') {
                    const p = entity.data;
                    const name = p.projectName || p.title || 'Unknown Project';
                    const deadline = p.deadline || p.endDate;
                    const startDate = p.startDate;

                    if (intent === 'project.deadline') {
                        reply = `📅 **Deadline for ${name}**: ${deadline ? new Date(deadline).toLocaleDateString() : 'No deadline set'}.`;
                    } else if (intent === 'project.team') {
                        reply = `👥 **Team for ${name}**:\n` +
                            `- **Assigned To**: ${p.assignedTo?.name || 'Multiple/Not assigned'}\n` +
                            `- **Role**: ${p.role || 'Not specified'}\n` +
                            `- **Assigned By**: ${p.assignedBy?.name || 'Management'}`;
                    } else if (intent === 'project.status') {
                        reply = `📊 **Current Status of ${name}**: \`${p.status}\` (Progress: \`${p.progressPercentage || 0}%\`)`;
                    } else if (intent === 'project.description') {
                        reply = `🚀 **About ${name}**:\n${p.description}`;
                    } else if (intent === 'project.skills') {
                        reply = `🛠️ **Required Skills for ${name}**:\n` +
                            (p.requiredSkills && p.requiredSkills.length > 0
                                ? p.requiredSkills.map(s => `- ${s.skill} (Level ${s.level}/5)`).join('\n')
                                : 'No specific skills listed.');
                    } else {
                        // Default full summary (intent === 'project.explain' or fallback)
                        reply = `### 🚀 Project Analysis: ${name}\n\n` +
                            `**Description**: ${p.description}\n\n` +
                            `**Current Status**: \`${p.status}\` | **Priority**: \`${p.priority || 'Medium'}\` | **Progress**: \`${p.progressPercentage || 0}%\`\n\n` +
                            `#### 📅 Key Dates\n` +
                            `- **Start Date**: ${startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}\n` +
                            `- **Deadline**: ${deadline ? new Date(deadline).toLocaleDateString() : 'No deadline set'}\n\n` +
                            `#### 👥 Assignment Details\n` +
                            `- **Role**: ${p.role || 'Not specified'}\n` +
                            `- **Assigned To**: ${p.assignedTo?.name || 'Multiple/Not assigned'}\n` +
                            `- **Assigned By**: ${p.assignedBy?.name || 'Management'}\n\n`;

                        if (p.requiredSkills && p.requiredSkills.length > 0) {
                            reply += `#### 🛠️ Required Skills\n` +
                                p.requiredSkills.map(s => `- ${s.skill} (Level ${s.level}/5)`).join('\n') + '\n\n';
                        }

                        reply += `*(For more comprehensive tracking, visit the Projects section in your dashboard)*`;
                    }
                } else if (entity.type === 'JobApplication') {
                    const a = entity.data;
                    reply = `### 📄 Application for ${a.candidateName}\n\n` +
                        `- **Job**: ${a.jobTitle}\n` +
                        `- **Status**: **${a.status}**\n` +
                        `- **Experience**: ${a.experience}\n` +
                        `- **Applied Date**: ${new Date(a.appliedDate).toLocaleDateString()}\n\n` +
                        `*(Resume and notes available in the Recruitment section)*`;
                }
            }
        }

        // D. Policy Retrieval (RAG Fallback)
        if (!reply && relevantPolicyChunks.length > 0) {
            const topChunk = relevantPolicyChunks[0];
            reply = `### 📑 Policy Information: ${topChunk.source}\n\n${topChunk.text}\n\n*(Information retrieved from internal HR archives)*`;
        }

        // E. Database Overview (The "Everything" data access)
        if (!reply && (msgLower.includes('database overview') || msgLower.includes('total summary') || msgLower.includes('what data'))) {
            const overview = Object.entries(dbContext)
                .map(([name, info]) => `- **${name}**: ${info.count} records (${info.fields.slice(0, 3).join(', ')}...)`)
                .join('\n');
            reply = `### 🗃️ Global System Intelligence\n\nI have real-time access to **${Object.keys(dbContext).length}** data collections:\n\n${overview}\n\nTry asking: *"Tell me about Project Alpha"* or *"How many job applications do we have?"*`;
        }

        // F. Final Catch-all / Fallback
        if (!reply) {
            reply = "I'm sorry, I couldn't find a direct match for that query. I can help you with:\n\n- **Company Stats** (Headcount, Payroll, Recruitment)\n- **Employee Search** (Details for a specific name)\n- **Project Status** (Overview of any project)\n- **HR Policies** (Search internal documents)\n\nTry asking: **'Show database overview'** to see everything I can access.";
        }

        // UI Enhancements
        if (action === "OPEN_LEAVE_MODAL") {
            reply = `I've opened the leave application form for you. \n\n${reply}`;
        }

        res.json({
            success: true,
            reply,
            intent: intent,
            action,
            data: actionData
        });

    } catch (error) {
        console.error('AI Processing Error:', error);
        res.status(500).json({ success: false, message: 'Internal AI processing failed' });
    }
};

exports.trainingPromise = trainingPromise;
