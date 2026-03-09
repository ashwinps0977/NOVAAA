import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { API_BASE_URL } from '../config';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronRight,
  Upload,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';

interface Job {
  id: number | string;
  _id?: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  minExperience: number;
  maxExperience: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  applicationDeadline: string;
  vacancies: number;
  postedDate: string;
  status: string;
  applicants: number;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    jobType: '',
    experienceLevel: '',
    location: ''
  });

  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentCompany: '',
    currentRole: '',
    experience: 0,
    coverLetter: '',
    skills: [] as string[],
    skillInput: '',
    resume: null as File | null,
    jobId: 0 as number | string
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);


  useEffect(() => {
    // Load jobs from backend
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
          setFilteredJobs(data.jobs || []);
        } else {
          console.error('Failed to fetch jobs:', response.status);
          // Fallback to localStorage
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Fallback to localStorage
        fallbackToLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const fallbackToLocalStorage = () => {
      const savedJobs = localStorage.getItem('postedJobs');
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);
        setJobs(parsedJobs);
        setFilteredJobs(parsedJobs);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search term and filters
    let filtered = jobs.filter(job => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = !filters.department || job.department === filters.department;
      const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
      const matchesExperience = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesDepartment && matchesJobType && matchesExperience && matchesLocation;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filters]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplicationData({
      ...applicationData,
      jobId: (job.id || job._id || '') as any
    });
    setShowApplicationForm(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationData({
        ...applicationData,
        resume: e.target.files[0]
      });
    }
  };

  const addSkill = () => {
    if (applicationData.skillInput.trim()) {
      setApplicationData({
        ...applicationData,
        skills: [...applicationData.skills, applicationData.skillInput.trim()],
        skillInput: ''
      });
    }
  };

  const removeSkill = (index: number) => {
    setApplicationData({
      ...applicationData,
      skills: applicationData.skills.filter((_, i) => i !== index)
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const formData = new FormData();
      // Safe string conversion
      const jobId = applicationData.jobId || '';
      formData.append('jobId', String(jobId));
      formData.append('fullName', applicationData.fullName);
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone);
      formData.append('currentCompany', applicationData.currentCompany);
      formData.append('currentRole', applicationData.currentRole);
      formData.append('experience', String(applicationData.experience || 0));
      formData.append('coverLetter', applicationData.coverLetter);
      formData.append('skills', JSON.stringify(applicationData.skills));
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      const response = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      if (response.ok) {
        await response.json();

        // Update job applicants count in local state
        const updatedJobs = jobs.map(job =>
          job.id === applicationData.jobId
            ? { ...job, applicants: job.applicants + 1 }
            : job
        );

        setJobs(updatedJobs);
        setFilteredJobs(updatedJobs);

        // Also update localStorage as fallback
        localStorage.setItem('postedJobs', JSON.stringify(updatedJobs));

        alert('Application submitted successfully!');

        // Reset form
        setShowApplicationForm(false);
        setSelectedJob(null);
        setApplicationData({
          fullName: '',
          email: '',
          phone: '',
          currentCompany: '',
          currentRole: '',
          experience: 0,
          coverLetter: '',
          skills: [],
          skillInput: '',
          resume: null,
          jobId: 0
        });
      } else {
        const errorText = await response.text();
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = errorText || `HTTP Error ${response.status}`;
        }
        alert(`Failed to submit application: ${errorMessage} (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(`Failed to submit application. Network or Client Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    if (!applicationData.email) {
      alert('Please enter your email first');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await fetch(`${API_BASE_URL}/applications/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: applicationData.email, type: 'email' })
      });

      if (response.ok) {
        setOtpSent(true);
        alert('Verification code sent to your email!');
      } else {
        alert('Failed to send verification code');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      alert('Please enter the verification code');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch(`${API_BASE_URL}/applications/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: applicationData.email,
          otp: otpCode,
          type: 'email'
        })
      });

      if (response.ok) {
        setIsEmailVerified(true);
        setOtpSent(false);
        alert('Email verified successfully!');
      } else {
        alert('Invalid or expired verification code');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
    } finally {
      setVerifying(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Job Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Apply for {selectedJob.title}</h2>
                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs uppercase tracking-wider">{selectedJob.department}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedJob.location}</span>
                </p>
              </div>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                disabled={submitting}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.fullName}
                    onChange={(e) => setApplicationData({ ...applicationData, fullName: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 pr-10"
                        value={applicationData.email}
                        onChange={(e) => {
                          setApplicationData({ ...applicationData, email: e.target.value });
                          setIsEmailVerified(false);
                          setOtpSent(false);
                        }}
                        disabled={submitting || isEmailVerified}
                      />
                      {isEmailVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    {!isEmailVerified && !submitting && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="px-5 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:bg-emerald-300 transition-all shadow-md shadow-emerald-200 hover:shadow-emerald-300 text-sm"
                      >
                        {otpLoading ? '...' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !isEmailVerified && (
                  <div className="col-span-1 md:col-span-2 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">
                      Enter the 6-digit code sent to your email
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        maxLength={6}
                        className="w-40 bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center tracking-[0.5em] font-bold text-xl"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifying}
                        className="flex-1 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:bg-emerald-300 transition-all"
                      >
                        {verifying ? 'Verifying...' : 'Confirm Verification'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Years of Experience <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.experience}
                    onChange={(e) => setApplicationData({ ...applicationData, experience: parseInt(e.target.value) || 0 })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Current Company
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Inc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.currentCompany}
                    onChange={(e) => setApplicationData({ ...applicationData, currentCompany: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Current Role
                  </label>
                  <input
                    type="text"
                    placeholder="Software Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.currentRole}
                    onChange={(e) => setApplicationData({ ...applicationData, currentRole: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Technical Skills <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    value={applicationData.skillInput}
                    onChange={(e) => setApplicationData({ ...applicationData, skillInput: e.target.value })}
                    placeholder="Add skills (e.g. React, Python)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {applicationData.skills.map((skill, index) => (
                    <div key={index} className="group flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 transition-all hover:bg-emerald-100">
                      <span className="text-sm font-medium">{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-emerald-400 hover:text-emerald-600 transition-colors"
                        disabled={submitting}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Cover Letter
                </label>
                <textarea
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  placeholder="I am passionate about this role because..."
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Resume (PDF/DOC) <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    id="resume-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    required
                    disabled={submitting}
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${applicationData.resume ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 group-hover:border-emerald-300 group-hover:bg-emerald-50/20'}`}>
                    <div className="bg-white w-14 h-14 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className={`w-6 h-6 ${applicationData.resume ? 'text-emerald-500' : 'text-slate-400'}`} />
                    </div>
                    <p className={`font-semibold mb-1 ${applicationData.resume ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {applicationData.resume ? applicationData.resume.name : 'Click or drag to upload resume'}
                    </p>
                    <p className="text-sm text-slate-500">Maximum file size: 5MB</p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-slate-50 -mx-8 -mb-8 px-8 py-6 flex justify-end gap-3 z-10 mt-auto">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-8 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-10 py-3.5 text-white font-bold rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg ${!isEmailVerified || submitting
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                    }`}
                  disabled={submitting || !isEmailVerified}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Jobs Page */}
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="relative mb-16 rounded-[2.5rem] bg-slate-900 overflow-hidden px-8 py-16 md:px-16 md:py-24 group">
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse"></div>
              <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-[20%] left-[40%] w-[30%] h-[40%] rounded-full bg-indigo-500/10 blur-[80px]"></div>

              {/* Pattern Overlay */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-6 animate-in slide-in-from-bottom-2 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                We're growing fast!
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1] animate-in slide-in-from-bottom-4 duration-1000">
                Build the <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Future</span> With Us
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium animate-in slide-in-from-bottom-6 duration-1000" style={{ animationDelay: '0.2s' }}>
                Join NOVA AI's mission to revolutionize enterprise intelligence. We're looking for passionate individuals to help us solve the world's most complex challenges.
              </p>
              <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '0.4s' }}>
                <a href="#browse-jobs" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/25 active:scale-95">
                  Browse Positions
                </a>

              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div id="browse-jobs" className="sticky top-28 z-40 mb-12 animate-in slide-in-from-bottom-10 duration-1000" style={{ animationDelay: '0.6s' }}>
            <div className="backdrop-blur-xl bg-white/70 p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 ring-1 ring-slate-100">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Role, skill, or keyword..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all font-medium placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center flex-1">
                  <div className="relative flex-1">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 appearance-none font-semibold text-slate-700 cursor-pointer"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                      <option value="">Departments</option>
                      {['Engineering', 'Design', 'Product', 'Sales', 'Marketing', 'Human Resources'].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 appearance-none font-semibold text-slate-700 cursor-pointer"
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    >
                      <option value="">Employment</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-2 border-l border-slate-100 hidden xl:flex flex-col justify-center text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Live Roles</span>
                  <span className="text-2xl font-black text-emerald-600 leading-none">{filteredJobs.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              {loading ? (
                <div className="bg-white rounded-[2rem] p-32 flex flex-col items-center justify-center border border-slate-100">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs">AI</div>
                    </div>
                  </div>
                  <p className="mt-6 text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Matching opportunities...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, idx) => (
                  <div
                    key={job.id || job._id}
                    className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <div className="relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {job.department}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${job.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                              }`}>
                              {job.status === 'active' ? '• Accepting Apps' : '• Position Closed'}
                            </span>
                          </div>

                          <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">{job.title}</h3>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-slate-500 mb-8 font-semibold text-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <Award className="w-4 h-4" />
                              </div>
                              <span className="capitalize">{job.experienceLevel}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <span>{job.salaryRange?.min ? `${job.salaryRange.min.toLocaleString()}k` : 'Competitive'} {job.salaryRange?.currency === 'USD' ? '$' : job.salaryRange.currency}</span>
                            </div>
                          </div>

                          <p className="text-slate-500 mb-8 leading-relaxed line-clamp-2 font-medium">{job.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 4).map((skill, index) => (
                              <span key={index} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold ring-1 ring-slate-100 transition-all group-hover:ring-emerald-100/50 group-hover:bg-emerald-50/30">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="px-3 py-1.5 bg-white text-slate-400 rounded-xl text-xs font-bold ring-1 ring-slate-100">
                                +{job.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:pl-10 lg:border-l border-slate-100">
                          <div className="hidden sm:block text-right mb-6">
                            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Applications</div>
                            <div className="text-3xl font-black text-slate-900 leading-none">{job.applicants || 0}</div>
                          </div>

                          <button
                            onClick={() => handleApply(job)}
                            disabled={job.status !== 'active'}
                            className={`w-full lg:w-40 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl ${job.status === 'active'
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                          >
                            {job.status === 'active' ? 'Apply Now' : 'Closed'}
                          </button>

                          <div className="mt-4 sm:hidden">
                            <span className="text-xs font-black text-slate-400">{job.applicants} Applicants</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Closing {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Soon'}</span>
                        </div>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-slate-900 hover:text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[2.5rem] p-24 text-center border-2 border-dashed border-slate-200">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Briefcase className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">No matching roles found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed mb-8">
                    Try adjusting your search or filters to find more opportunities.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilters({ department: '', jobType: '', experienceLevel: '', location: '' }) }}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Sidebar / Details Preview */}
            <div className="xl:col-span-1">
              <div className="sticky top-28 space-y-6">
                {selectedJob ? (
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] animate-in slide-in-from-right-8 duration-700">
                    <div className="flex items-start justify-between mb-8">
                      <div className="bg-emerald-50 p-4 rounded-3xl">
                        <Briefcase className="w-8 h-8 text-emerald-600" />
                      </div>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="p-2 hover:bg-slate-50 text-slate-300 hover:text-slate-500 rounded-xl transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight">{selectedJob.title}</h3>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                          <span className="w-4 h-[2px] bg-emerald-500"></span>
                          Key Information
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Potential Salary</p>
                            <p className="text-lg font-black text-slate-900">{selectedJob.salaryRange?.min ? `${selectedJob.salaryRange.min.toLocaleString()}k - ${selectedJob.salaryRange.max.toLocaleString()}k` : 'Negotiable'}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role Type</p>
                            <p className="text-lg font-black text-slate-900 capitalize">{selectedJob.jobType}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                          <span className="w-4 h-[2px] bg-emerald-500"></span>
                          The Mission
                        </h4>
                        <p className="text-slate-500 font-medium leading-relaxed">
                          {selectedJob.description}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-50">
                        <button
                          onClick={() => handleApply(selectedJob)}
                          className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                          Apply For This Role
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;