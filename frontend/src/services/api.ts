// api.ts - FINAL CLEAN VERSION FOR MONGODB
import { API_BASE_URL as API_URL } from '../config';

export interface UserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt?: string;
    lastLogin?: string;
  };
}

export const checkDBStatus = async (): Promise<{ dbConnected: boolean, totalUsers: number }> => {
  try {
    const response = await fetch(`${API_URL}/db-status`);
    const data = await response.json();
    console.log('📊 Database Status:', data.message);
    console.log('📁 Collections:', data.collections);
    console.log('👥 Total Users:', data.totalUsers);
    return {
      dbConnected: data.dbConnected || false,
      totalUsers: data.totalUsers || 0
    };
  } catch (error) {
    console.error('❌ Cannot check database status');
    return { dbConnected: false, totalUsers: 0 };
  }
};

export const authAPI = {
  register: async (userData: UserData): Promise<AuthResponse> => {
    // ⚠️ MUST BE THIS EXACTLY - REAL MONGODB ENDPOINT
    const url = `${API_URL}/auth/register`;

    console.log('🚀 Calling REAL MongoDB endpoint:', url);
    console.log('👤 Registering user:', userData.name, userData.email);
    console.log('🎯 Role:', userData.role || 'employee');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();

      // Debug logging to see what's happening
      console.log('📢 BACKEND RESPONSE MESSAGE:', result.message);
      console.log('📦 RESPONSE DATA:', {
        success: result.success,
        userEmail: result.user?.email,
        userId: result.user?.id
      });

      // Check if data was saved to MongoDB
      if (result.message && result.message.includes('MongoDB')) {
        console.log('✅ SUCCESS: User saved to MongoDB!');
        console.log(`📊 Check users at: ${API_URL}/users`);
      } else if (result.message && result.message.includes('TEST')) {
        console.warn('⚠️  WARNING: Data in MEMORY only (will be lost on restart)');
        console.warn('⚠️  MongoDB is not saving data!');
      } else {
        console.log('📝 Registration completed');
      }

      return result;

    } catch (error: any) {
      console.error('❌ Registration error:', error.message);

      // Optional: Fallback to test endpoint
      console.log('🔄 Trying fallback to test endpoint...');
      try {
        const testUrl = `${API_URL}/auth/test-register`;
        console.log('🧪 Using test endpoint:', testUrl);

        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        if (testResponse.ok) {
          const testResult = await testResponse.json();
          console.warn('⚠️  Using TEST MODE - Data not saved to MongoDB');
          console.warn('⚠️  Data will be lost when server restarts');
          return testResult;
        }
      } catch {
        console.error('❌ Test endpoint also failed');
      }

      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    // ⚠️ MUST BE THIS EXACTLY - REAL MONGODB ENDPOINT
    const url = `${API_URL}/auth/login`;

    console.log('🔐 Calling REAL MongoDB login endpoint:', url);
    console.log('👤 Logging in:', credentials.email);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();

      console.log('📢 Login response:', result.message);

      return result;

    } catch (error: any) {
      console.error('❌ Login error:', error.message);

      // Fallback to test endpoint
      try {
        const testUrl = `${API_URL}/auth/test-login`;
        const testResponse = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (testResponse.ok) {
          const testResult = await testResponse.json();
          console.warn('⚠️  Using TEST MODE for login');
          return testResult;
        }
      } catch {
        // Ignore fallback error
      }

      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  // Additional debug function
  testConnection: async (): Promise<void> => {
    console.log('🔍 Testing API connection...');

    try {
      // Test health endpoint
      const healthRes = await fetch(`${API_URL}/health`);
      const healthData = await healthRes.json();
      console.log('🏥 Health:', healthData);

      // Test DB status
      const dbRes = await fetch(`${API_URL}/db-status`);
      const dbData = await dbRes.json();
      console.log('🗄️  DB Status:', dbData);

      // Test users endpoint
      const usersRes = await fetch(`${API_URL}/users`);
      const usersData = await usersRes.json();
      console.log('👥 Users:', usersData);

    } catch (error) {
      console.error('❌ Connection test failed:', error);
    }
  }
};