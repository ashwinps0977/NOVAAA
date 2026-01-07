import { useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onReject: (rejectionReason: string) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  application,
  onReject
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onReject(rejectionReason);
      onClose();
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectionTemplates = [
    'We have decided to move forward with other candidates whose qualifications more closely match our requirements.',
    'Your experience does not align with the specific requirements of this role.',
    'We are looking for candidates with more experience in the required technologies.',
    'The position has been filled by an internal candidate.',
    'We have put this role on hold due to business needs.'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reject Application</h2>
              <p className="text-gray-600 text-sm">{application?.candidateName}</p>
            </div>
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
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to reject {application?.candidateName}'s application for {application?.jobTitle}?
            </p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (will be included in email)
            </label>
            
            <div className="space-y-2 mb-4">
              {rejectionTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRejectionReason(template)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {template}
                </button>
              ))}
            </div>
            
            <textarea
              rows={4}
              required
              placeholder="Or write a custom rejection message..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            
            <p className="text-xs text-gray-500 mt-2">
              This message will be sent to the candidate via email.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rejectionReason.trim()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Reject & Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;