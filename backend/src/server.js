require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const hrRoutes = require('./routes/hrRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Improved Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/NOVAHR1';

    console.log(`📡 Connecting to MongoDB at: ${mongoURI}`);

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });

    console.log('✅ MongoDB connected successfully to NOVAHR1');

    // Verify users collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      console.log('📁 Creating users collection...');
      await mongoose.connection.db.createCollection('users');
      console.log('✅ Users collection created');
    }

    console.log(`📊 Collections in NOVAHR1: ${collectionNames.join(', ')}`);

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Run: mongod --dbpath="C:\\data\\db"');
    console.log('3. Or: net start MongoDB (as Administrator)');
    console.log('\n⚠️  Starting without database - using test mode');
  }
};

// Connect to database
connectDB();

// Middleware to check DB connection
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️  Database not connected, using test mode');
    req.useTestMode = true;
  } else {
    req.useTestMode = false;
  }
  next();
};

// Auth routes
app.use('/api/auth', checkDB, authRoutes);

// HR routes
app.use('/api/hr', checkDB, hrRoutes);

// Job routes
app.use('/api/jobs', checkDB, jobRoutes);

// Application routes
// Application routes
app.use('/api/applications', checkDB, applicationRoutes);

// Attendance routes
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', checkDB, attendanceRoutes);

// Leave routes
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leave', checkDB, leaveRoutes);

// Project routes
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', checkDB, projectRoutes);

// AI routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', checkDB, aiRoutes);

// Temporary test endpoints (only used when DB is not connected)
const tempUsers = [];
const tempApplications = [];
const tempInterviews = [];
const tempJobs = [];

// Test registration endpoint
app.post('/api/auth/test-register', async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    const existingUser = tempUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      isVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    tempUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful (TEST MODE - Not saved to MongoDB)',
      token: 'test-jwt-token-' + Date.now(),
      user: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test login endpoint
app.post('/api/auth/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = tempUsers.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful (TEST MODE)',
      token: 'test-jwt-token-' + Date.now(),
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test HR endpoints for when DB is not connected
app.post('/api/hr/test/applications/:id/schedule-interview', async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime, interviewType, interviewers, meetingLink, notes } = req.body;

    const applicationIndex = tempApplications.findIndex(app => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const interview = {
      id: Date.now().toString(),
      applicationId: id,
      candidateName: tempApplications[applicationIndex].candidateName,
      candidateEmail: tempApplications[applicationIndex].email,
      jobTitle: tempApplications[applicationIndex].jobTitle,
      interviewDate,
      interviewTime,
      interviewType,
      interviewers,
      meetingLink,
      notes,
      status: 'scheduled',
      scheduledAt: new Date(),
      createdAt: new Date()
    };

    tempInterviews.push(interview);

    // Update application status
    tempApplications[applicationIndex].status = 'interview_scheduled';
    tempApplications[applicationIndex].interviewId = interview.id;

    console.log(`📅 Test interview scheduled for ${tempApplications[applicationIndex].candidateName}`);
    console.log(`📧 Email would be sent to: ${tempApplications[applicationIndex].email}`);

    res.json({
      success: true,
      message: 'Interview scheduled successfully (TEST MODE)',
      interview,
      emailSent: true
    });
  } catch (error) {
    console.error('Test interview scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/hr/test/applications/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const applicationIndex = tempApplications.findIndex(app => app.id === id);

    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application status
    tempApplications[applicationIndex].status = 'rejected';
    tempApplications[applicationIndex].rejectionReason = rejectionReason;
    tempApplications[applicationIndex].rejectedAt = new Date();

    console.log(`❌ Test rejection for ${tempApplications[applicationIndex].candidateName}`);
    console.log(`📧 Rejection email would be sent to: ${tempApplications[applicationIndex].email}`);
    console.log(`📝 Reason: ${rejectionReason}`);

    res.json({
      success: true,
      message: 'Application rejected successfully (TEST MODE)',
      emailSent: true
    });
  } catch (error) {
    console.error('Test rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test endpoint to get applications
app.get('/api/hr/test/applications', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Applications retrieved (TEST MODE)',
      applications: tempApplications,
      count: tempApplications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test endpoint to get jobs
app.get('/api/jobs/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Jobs retrieved (TEST MODE)',
      jobs: tempJobs,
      count: tempJobs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test endpoint to create job
app.post('/api/jobs/test', async (req, res) => {
  try {
    const job = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    tempJobs.push(job);

    res.status(201).json({
      success: true,
      message: 'Job created successfully (TEST MODE)',
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test endpoint to get job applications
app.get('/api/applications/test', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Applications retrieved (TEST MODE)',
      applications: tempApplications,
      count: tempApplications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test endpoint to create application
app.post('/api/applications/test', async (req, res) => {
  try {
    const application = {
      id: Date.now().toString(),
      ...req.body,
      appliedDate: new Date(),
      status: 'pending'
    };

    tempApplications.push(application);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully (TEST MODE)',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NOVA API is running',
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? 'MongoDB Mode' : 'Test Mode',
    dbName: 'NOVAHR1',
    endpoints: {
      auth: '/api/auth',
      hr: '/api/hr',
      jobs: '/api/jobs',
      applications: '/api/applications',
      test: '/api/hr/test'
    }
  });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const usersCount = await mongoose.connection.db.collection('users').countDocuments();

      res.json({
        success: true,
        dbConnected: true,
        database: 'NOVAHR1',
        collections: collections.map(c => c.name),
        totalUsers: usersCount,
        message: '✅ Connected to MongoDB'
      });
    } else {
      res.json({
        success: true,
        dbConnected: false,
        message: '❌ Not connected to MongoDB',
        testUsers: tempUsers.length,
        testJobs: tempJobs.length,
        testApplications: tempApplications.length,
        testInterviews: tempInterviews.length
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking database status'
    });
  }
});

// List all users (both test and real)
app.get('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Get users from MongoDB
      const users = await mongoose.connection.db.collection('users').find().toArray();
      res.json({
        success: true,
        source: 'mongodb',
        users: users,
        count: users.length
      });
    } else {
      // Get users from test memory
      res.json({
        success: true,
        source: 'test-memory',
        users: tempUsers,
        count: tempUsers.length,
        warning: '⚠️ Data is in memory only and will be lost on server restart'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Initialize test data
const initializeTestData = () => {
  // Add some test applications
  if (tempApplications.length === 0) {
    const testApplications = [
      {
        id: 'app1',
        candidateName: 'John Doe',
        email: 'john@example.com',
        jobTitle: 'Senior React Developer',
        status: 'under_review',
        appliedDate: new Date('2024-01-10'),
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        experience: '5 years',
        resumeUrl: 'https://example.com/resumes/john_doe.pdf'
      },
      {
        id: 'app2',
        candidateName: 'Jane Smith',
        email: 'jane@example.com',
        jobTitle: 'Product Designer',
        status: 'under_review',
        appliedDate: new Date('2024-01-12'),
        skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
        experience: '4 years',
        resumeUrl: 'https://example.com/resumes/jane_smith.pdf'
      },
      {
        id: 'app3',
        candidateName: 'Mike Johnson',
        email: 'mike@example.com',
        jobTitle: 'Full Stack Developer',
        status: 'under_review',
        appliedDate: new Date('2024-01-15'),
        skills: ['Python', 'Django', 'React', 'PostgreSQL'],
        experience: '6 years',
        resumeUrl: 'https://example.com/resumes/mike_johnson.pdf'
      }
    ];

    tempApplications.push(...testApplications);
    console.log(`📄 Initialized ${tempApplications.length} test applications`);
  }

  // Add some test jobs
  if (tempJobs.length === 0) {
    const testJobs = [
      {
        id: 'job1',
        title: 'Senior React Developer',
        department: 'Engineering',
        location: 'Remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salaryRange: {
          min: 90000,
          max: 130000,
          currency: 'USD'
        },
        description: 'We are looking for an experienced React developer to join our team...',
        responsibilities: [
          'Develop new user-facing features using React.js',
          'Build reusable components and front-end libraries',
          'Translate designs and wireframes into high-quality code'
        ],
        requirements: [
          '5+ years of experience with React.js',
          'Strong proficiency in JavaScript, including DOM manipulation',
          'Experience with popular React.js workflows (Redux)'
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        benefits: ['Health insurance', 'Remote work', 'Flexible hours'],
        applicationDeadline: new Date('2024-02-28'),
        vacancies: 2,
        postedDate: new Date('2024-01-01'),
        status: 'active',
        applicants: 3
      },
      {
        id: 'job2',
        title: 'Product Designer',
        department: 'Design',
        location: 'San Francisco, CA',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: {
          min: 80000,
          max: 110000,
          currency: 'USD'
        },
        description: 'Join our design team to create beautiful and functional user interfaces...',
        responsibilities: [
          'Create user-centered designs',
          'Develop wireframes and prototypes',
          'Collaborate with product managers and engineers'
        ],
        requirements: [
          '3+ years of product design experience',
          'Proficiency in Figma or similar tools',
          'Strong portfolio demonstrating design skills'
        ],
        skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
        benefits: ['Health insurance', '401(k)', 'Stock options'],
        applicationDeadline: new Date('2024-02-20'),
        vacancies: 1,
        postedDate: new Date('2024-01-05'),
        status: 'active',
        applicants: 2
      }
    ];

    tempJobs.push(...testJobs);
    console.log(`💼 Initialized ${tempJobs.length} test jobs`);
  }
};

// Initialize test data on server start
initializeTestData();

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  require('fs').writeFileSync('server_error_log.txt', `Error: ${err.message}\nStack: ${err.stack}\n`);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  DB Status: http://localhost:${PORT}/api/db-status`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`👔 HR Endpoints: http://localhost:${PORT}/api/hr`);
  console.log(`💼 Job Endpoints: http://localhost:${PORT}/api/jobs`);
  console.log(`📄 Application Endpoints: http://localhost:${PORT}/api/applications`);
  console.log(`🧪 Test HR Endpoints: http://localhost:${PORT}/api/hr/test`);
  console.log(`\n🔗 MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log(`🔧 Mode: ${mongoose.connection.readyState === 1 ? 'Production (MongoDB)' : 'Test (Memory)'}`);
  console.log(`📊 Test data: ${tempApplications.length} applications, ${tempJobs.length} jobs loaded`);
});