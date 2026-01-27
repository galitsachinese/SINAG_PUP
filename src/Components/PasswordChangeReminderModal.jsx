import { AlertTriangle, Key, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PasswordChangeReminderModal = ({ isVisible, onClose, userRole }) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleChangePassword = () => {
    onClose();
    // Navigate to profile page where password change is available
    if (userRole === 'supervisor') {
      navigate('/pup-sinag/supervisor/profile');
    } else if (userRole === 'adviser') {
      navigate('/pup-sinag/adviser/profile');
    } else if (userRole === 'intern') {
      navigate('/pup-sinag/intern/profile');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Key className="w-6 h-6 text-red-800" />
            </div>
            <h3 className="text-xl font-black text-white">Password Update Required</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-50 p-4 rounded-full">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-black mb-2">Security Notice</h4>
            <p className="text-gray-600 leading-relaxed">
              You are currently using the default password provided by the coordinator. For your account security,
              please change your password as soon as possible.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleChangePassword}
              className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              Change Password Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeReminderModal;
