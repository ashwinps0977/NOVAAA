const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/mailer');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Fixed time
  );
};

// Register User - SIMPLIFIED
exports.register = async (req, res) => {
  console.log('🎯 REGISTER REQUEST RECEIVED');
  console.log('📦 Data:', req.body);

  try {
    const { name, email, password, role = 'employee' } = req.body;

    // Handle Test Mode
    if (req.useTestMode) {
      console.log('🧪 TEST MODE: Registration');
      const { tempUsers } = require('../server');

      const existingUser = tempUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        role,
        isVerified: false,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      tempUsers.push(newUser);

      return res.status(201).json({
        success: true,
        message: 'Registration successful (TEST MODE - Not saved to MongoDB)',
        token: 'test-jwt-token-' + Date.now(),
        user: newUser
      });
    }

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role
    const validRoles = ['employee', 'hr', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user WITHOUT pre-save hook issues
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      lastLogin: new Date()
    });

    // Save to MongoDB
    await user.save();

    console.log('✅ USER SAVED TO MONGODB:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // If role is employee, also create an Employee record
    if (role === 'employee') {
      try {
        const employee = new Employee({
          name,
          email,
          password: hashedPassword, // Reuse hash
          role,
          department: req.body.department || 'Unassigned',
          position: req.body.position || 'New Hire',
          status: 'active',
          joiningDate: new Date()
        });
        await employee.save();
        console.log('✅ EMPLOYEE RECORD CREATED');
      } catch (empError) {
        console.error('⚠️ Failed to create employee record:', empError.message);
        // We don't fail the whole registration, but log it
      }
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful - Saved to MongoDB',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ REGISTRATION ERROR DETAILS:', error);

    // Specific error messages
    let errorMessage = 'Registration failed';
    if (error.code === 11000) {
      errorMessage = 'Email already exists';
    } else if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- DEVELOPMENT TEST CREDENTIALS ---
    const isDev = process.env.NODE_ENV === 'development' || !process.env.MONGODB_URI;
    if (isDev) {
      console.log('🧪 AUTH: Development credentials enabled');
      // Simple hardcoded test user for development
      if ((email === 'hr@nova.com' || email === 'admin@nova.com') && password === 'admin123') {
        const testUser = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test HR Admin',
          email: email,
          role: 'hr',
          isVerified: true
        };
        const token = generateToken(testUser);
        return res.json({
          success: true,
          message: 'Login successful (Test Mode)',
          token,
          user: {
            id: testUser._id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role,
            isVerified: true,
            lastLogin: new Date()
          }
        });
      }

      if (email === 'employee@nova.com' && password === 'employee123') {
        const testUser = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Employee',
          email: email,
          role: 'employee',
          isVerified: true
        };
        const token = generateToken(testUser);
        return res.json({
          success: true,
          message: 'Login successful (Test Mode)',
          token,
          user: {
            id: testUser._id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role,
            isVerified: true,
            lastLogin: new Date()
          }
        });
      }
    }

    // Find user by email or name
    let user;
    if (req.useTestMode) {
      console.log('🧪 TEST MODE: Login');
      const { tempUsers } = require('../server');
      user = tempUsers.find(u => u.email === email || u.name === email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, name or password'
        });
      }

      // Skip password check in test mode for simplicity OR implement basic check
      // For now, let's just allow it if found

      return res.json({
        success: true,
        message: 'Login successful (TEST MODE)',
        token: 'test-jwt-token-' + Date.now(),
        user
      });
    }

    user = await User.findOne({
      $or: [
        { email: email },
        { name: email } // 'email' variable holds the identifier from the form
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, name or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Auto-mark attendance
    try {
      const attendanceController = require('./attendanceController');
      await attendanceController.markCheckIn(user._id);
    } catch (attError) {
      console.error('Auto-attendance failed:', attError);
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Logout User
exports.logout = async (req, res) => {
  try {
    // Auto-mark check-out
    try {
      if (req.user && req.user.id) {
        const attendanceController = require('./attendanceController');
        await attendanceController.markCheckOut(req.user.id);
      }
    } catch (attError) {
      console.error('Auto-checkout failed:', attError);
      // We don't fail logout just because attendance update failed
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get current user profile (from token)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware

    // --- TEST MODE FALLBACK ---
    if (req.useTestMode || mongoose.connection.readyState !== 1) {
      console.log('🧪 AUTH: Current User Test Fallback');
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          name: 'Test User',
          email: req.user.email,
          role: req.user.role,
          isVerified: true
        }
      });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = { ...user.toObject() };

    // If user is an employee, fetch extended profile details
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ email: user.email }).select('-password');
      if (employee) {
        profileData = {
          ...profileData,
          employeeId: employee._id,
          department: employee.department,
          position: employee.position,
          phone: employee.phone,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          project: employee.project,
          status: employee.status
        };
      }
    }

    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, department, position } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (position) user.position = position;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        position: user.position
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Forgot Password - Generate Token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address'
      });
    }

    // Generate token
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');

    // Set token and expiry on user model
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send Real Email
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
        <h2 style="color: #10b981; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #4b5563; line-height: 1.5;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p style="color: #4b5563; line-height: 1.5;">Please click on the button below to complete the process:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated email from NOVA Workforce Management. Please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Password Reset Request', message);
      console.log(`✅ Reset email sent to: ${email}`);
    } catch (mailError) {
      console.error('❌ Failed to send reset email:', mailError);
      // We still return success as the token IS saved, but warn in log
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request'
    });
  }
};

// Reset Password - Update Password using Token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now log in.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// Social Login - Google/GitHub Simulation
exports.socialLogin = async (req, res) => {
  try {
    const { email, name, provider, id } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for social login'
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`🆕 Creating new social user (${provider}): ${email}`);

      // For social users, we generate a random password they won't use
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'employee', // Default role
        isVerified: true, // Social emails are pre-verified
        lastLogin: new Date()
      });

      await user.save();

      // Also create Employee record
      try {
        const employee = new Employee({
          name,
          email,
          password: hashedPassword,
          role: 'employee',
          department: 'Unassigned',
          position: 'New Hire',
          status: 'active',
          joiningDate: new Date()
        });
        await employee.save();
      } catch (empError) {
        console.error('⚠️ Failed to create employee record for social login:', empError.message);
      }
    } else {
      console.log(`✅ Existing social user logged in: ${email}`);
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: `${provider} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing social login request'
    });
  }
};

// Handle OAuth Callback
exports.handleOAuthCallback = (req, res) => {
  const token = generateToken(req.user);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Redirect to frontend with token
  res.redirect(`${frontendUrl}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified
  }))}`);
};
