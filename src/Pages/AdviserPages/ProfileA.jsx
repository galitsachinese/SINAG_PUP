import { CheckCircle, Eye, EyeOff, Lock, Mail, Save, Shield, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// Theme colors
const PRIMARY_COLOR_BG = 'bg-red-800';
const BORDER_COLOR = 'border-red-800';
const INPUT_FOCUS_RING = 'focus:ring-red-500 focus:border-red-500';

const ProfileA = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    mi: '',
    email: '',
    program: '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        const user = data.user;

        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          mi: user.mi || '',
          email: user.email || '',
          program: user.program || '',
        });
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      setLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed: ${response.status}`);

      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleCombinedSave = () => {
    if (currentPassword || newPassword || confirmNewPassword) {
      handleChangePassword();
    } else {
      handleSaveProfile();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full h-screen">
        {/* Left Sidebar - Profile Card */}
        <div
          className={`w-full lg:w-80 ${PRIMARY_COLOR_BG} text-white flex flex-col items-center justify-center p-6 lg:p-8`}
        >
          <div className="bg-white/20 backdrop-blur-sm p-6 lg:p-8 rounded-full mb-4 lg:mb-6">
            <User className="w-16 h-16 lg:w-24 lg:h-24" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-4 text-center uppercase">
            {profileData.firstName} {profileData.mi && `${profileData.mi}.`} {profileData.lastName || 'COMPLETE NAME'}
          </h1>
          <div className="flex items-center gap-2 text-white">
            <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
            <p className="text-sm lg:text-base uppercase break-all">{profileData.email || 'USER@GMAIL.COM'}</p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {/* Compact Alerts */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-3 lg:px-4 py-2 lg:py-3 rounded-lg mb-3 lg:mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <div>
                <strong className="font-semibold">Error!</strong> {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-3 lg:px-4 py-2 lg:py-3 rounded-lg mb-3 lg:mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <div>
                <strong className="font-semibold">Success!</strong> {successMessage}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-red-700 px-3 lg:px-4 py-2 lg:py-3 flex items-center gap-2">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                <h2 className="text-sm lg:text-base font-bold text-white">Personal Information</h2>
              </div>

              <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <User className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className={`w-full px-3 lg:px-4 py-2 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                    disabled={loading}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Email Address
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={`w-full px-3 lg:px-4 py-2 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings Section */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-red-700 px-3 lg:px-4 py-2 lg:py-3 flex items-center gap-2">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                <h2 className="text-sm lg:text-base font-bold text-white">Security Settings</h2>
              </div>

              <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
                {/* Current Password */}
                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`w-full px-3 lg:px-4 py-2 pr-10 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                      disabled={loading}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-3 lg:px-4 py-2 pr-10 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                      disabled={loading}
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Lock className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`w-full px-3 lg:px-4 py-2 pr-10 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                      disabled={loading}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certification and Button */}
          <div className="space-y-3 lg:space-y-4">
            <div className="p-3 lg:p-4 border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-white rounded-r-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-gray-700 text-xs lg:text-sm">
                  <span className="font-semibold">Certification:</span> I hereby certify that all information provided
                  is true and correct.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCombinedSave}
                className={`flex items-center gap-2 py-2 lg:py-2.5 px-6 lg:px-8 ${PRIMARY_COLOR_BG} hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-sm">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileA;
