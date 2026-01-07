import { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, User, Mail, Send } from 'lucide-react';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onSchedule: (interviewData: InterviewData) => void;
}

interface InterviewData {
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  interviewLink: string;
  interviewLocation: string;
  interviewerName: string;
  interviewerEmail: string;
  additionalNotes: string;
}

const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onSchedule
}) => {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    interviewDate: '',
    interviewTime: '',
    interviewType: 'video',
    interviewLink: '',
    interviewLocation: '',
    interviewerName: '',
    interviewerEmail: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSchedule(interviewData);
      onClose();
    } catch (error) {
      console.error('Failed to schedule interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Interview</h2>
            <p className="text-gray-600 mt-1">
              For: {application?.candidateName} - {application?.jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Candidate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-600">Name</p>
                <p className="font-medium">{application?.candidateName}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Email</p>
                <p className="font-medium">{application?.email}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Job Applied</p>
                <p className="font-medium">{application?.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Skill Match</p>
                <p className="font-medium text-emerald-600">{application?.matchPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Interview Date *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={interviewData.interviewDate}
                  onChange={(e) => setInterviewData({...interviewData, interviewDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Interview Time *
                </label>
                <input
                  type="time"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={interviewData.interviewTime}
                  onChange={(e) => setInterviewData({...interviewData, interviewTime: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={interviewData.interviewType}
                  onChange={(e) => setInterviewData({...interviewData, interviewType: e.target.value})}
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {interviewData.interviewType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Video className="inline w-4 h-4 mr-1" />
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    value={interviewData.interviewLink}
                    onChange={(e) => setInterviewData({...interviewData, interviewLink: e.target.value})}
                  />
                </div>
              )}

              {interviewData.interviewType === 'in-person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Office Address, Room Number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    value={interviewData.interviewLocation}
                    onChange={(e) => setInterviewData({...interviewData, interviewLocation: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Interviewer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={interviewData.interviewerName}
                  onChange={(e) => setInterviewData({...interviewData, interviewerName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Interviewer Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="interviewer@company.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  value={interviewData.interviewerEmail}
                  onChange={(e) => setInterviewData({...interviewData, interviewerEmail: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                rows={3}
                placeholder="Please prepare for a technical discussion. Bring any relevant documents..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                value={interviewData.additionalNotes}
                onChange={(e) => setInterviewData({...interviewData, additionalNotes: e.target.value})}
              />
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Email Preview:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Subject:</strong> Interview Invitation: {application?.jobTitle} at NOVA HR</p>
              <p><strong>To:</strong> {application?.email}</p>
              <p>
                Dear {application?.candidateName},<br/>
                You have been invited for a {interviewData.interviewType} interview on {interviewData.interviewDate} at {interviewData.interviewTime}.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white border-t pt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Schedule & Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewModal;