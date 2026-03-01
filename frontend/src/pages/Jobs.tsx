import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { API_BASE_URL } from '../config';
import {
  Search,
  Filter,
  MapPin,
  Clock,
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Apply for {selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.department} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={submitting}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.fullName}
                    onChange={(e) => setApplicationData({ ...applicationData, fullName: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      required
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                      value={applicationData.email}
                      onChange={(e) => {
                        setApplicationData({ ...applicationData, email: e.target.value });
                        setIsEmailVerified(false);
                        setOtpSent(false);
                      }}
                      disabled={submitting || isEmailVerified}
                    />
                    {!isEmailVerified && !submitting && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm whitespace-nowrap"
                      >
                        {otpLoading ? 'Sending...' : 'Verify'}
                      </button>
                    )}
                    {isEmailVerified && (
                      <div className="flex items-center text-emerald-600 font-medium text-sm">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                {otpSent && !isEmailVerified && (
                  <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Enter Verification Code sent to {applicationData.email}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        className="w-32 border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-center tracking-[0.5em] font-bold"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifying}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                      >
                        {verifying ? 'Verifying...' : 'Confirm Code'}
                      </button>
                    </div>
                  </div>
                )}


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.experience}
                    onChange={(e) => setApplicationData({ ...applicationData, experience: parseInt(e.target.value) || 0 })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Company
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.currentCompany}
                    onChange={(e) => setApplicationData({ ...applicationData, currentCompany: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Role
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.currentRole}
                    onChange={(e) => setApplicationData({ ...applicationData, currentRole: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    value={applicationData.skillInput}
                    onChange={(e) => setApplicationData({ ...applicationData, skillInput: e.target.value })}
                    placeholder="Add your skills"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {applicationData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        disabled={submitting}
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  placeholder="Tell us why you're a good fit for this role..."
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume (PDF/DOC) *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    {applicationData.resume
                      ? `Selected: ${applicationData.resume.name}`
                      : 'Drag & drop your resume or click to browse'
                    }
                  </p>
                  <input
                    type="file"
                    id="resume-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    required
                    disabled={submitting}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`inline-block px-4 py-2 rounded-lg cursor-pointer ${submitting
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max file size: 5MB</p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t pt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white rounded-lg flex items-center space-x-2 ${!isEmailVerified || submitting
                    ? 'bg-emerald-300 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  disabled={submitting || !isEmailVerified}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
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
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities</h1>
          <p className="text-gray-600 text-lg">
            Join our team and help shape the future. Browse open positions and apply today.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skill, or keyword..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resources">Human Resources</option>
              </select>

              <select
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                value={filters.jobType}
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {loading ? 'Loading jobs...' : `Showing ${filteredJobs.length} of ${jobs.length} open positions`}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          /* Jobs Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List */}
            <div className="lg:col-span-2 space-y-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 transition-all">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {job.department}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {job.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span className="capitalize">{job.experienceLevel} Level</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 5).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Posted</div>
                          <div className="font-medium">{new Date(job.postedDate).toLocaleDateString()}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">Applicants</div>
                          <div className="font-medium">{job.applicants}</div>
                        </div>

                        <button
                          onClick={() => handleApply(job)}
                          disabled={job.status !== 'active'}
                          className={`px-6 py-2 rounded-lg font-medium ${job.status === 'active'
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          {job.status === 'active' ? 'Apply Now' : 'Closed'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Apply before: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Available</h3>
                  <p className="text-gray-600">Check back later for new opportunities.</p>
                </div>
              )}
            </div>

            {/* Job Details Sidebar */}
            {selectedJob && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {selectedJob.department}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {selectedJob.jobType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Job Description</h4>
                      <p className="text-gray-600">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
                      <ul className="space-y-2">
                        {selectedJob.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <Award className="w-4 h-4 text-purple-500 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t">
                      <button
                        onClick={() => handleApply(selectedJob)}
                        className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                      >
                        Apply for this Position
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;