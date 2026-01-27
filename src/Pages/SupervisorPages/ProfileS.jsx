import { ArrowLeft, Building, CheckCircle, Eye, EyeOff, Lock, Mail, Save, Shield, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR_BG = 'bg-red-800';
const BORDER_COLOR = 'border-red-800';
const INPUT_FOCUS_RING = 'focus:ring-red-500 focus:border-red-500';

const ProfileS = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    supervisorName: '',
    companyName: '',
    natureOfBusiness: '',
    email: '',
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

  /* =========================
     FETCH COMPANY PROFILE
  ========================= */
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/auth/company/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setProfileData({
          supervisorName: data.supervisorName || '',
          companyName: data.name || data.companyName || '',
          natureOfBusiness: data.natureOfBusiness || '',
          email: data.email || '',
        });
      } catch (err) {
        setError('Failed to load company information.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/auth/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supervisorName: profileData.supervisorName,
          name: profileData.companyName,
          natureOfBusiness: profileData.natureOfBusiness,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CHANGE PASSWORD
  ========================= */
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

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
      if (!response.ok) throw new Error(data.message);

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
          className={`w-full lg:w-80 ${PRIMARY_COLOR_BG} text-white flex flex-col items-center justify-between p-6 lg:p-8`}
        >
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm p-6 lg:p-8 rounded-full mb-4 lg:mb-6">
              <Building className="w-16 h-16 lg:w-24 lg:h-24" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-4 text-center uppercase">
              {profileData.companyName || 'COMPANY NAME'}
            </h1>
            <div className="flex items-center gap-2 text-white mb-2">
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              <p className="text-sm lg:text-base uppercase">{profileData.supervisorName || 'SUPERVISOR'}</p>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
              <p className="text-xs lg:text-sm uppercase break-all">{profileData.email || 'EMAIL@COMPANY.COM'}</p>
            </div>
          </div>

          {/* Back to Dashboard Button */}
          <button
            onClick={() => navigate('..')}
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:border-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base">Back to Dashboard</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {' '}
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
            {/* Company Information Section */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-red-700 px-3 lg:px-4 py-2 lg:py-3 flex items-center gap-2">
                <Building className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                <h2 className="text-sm lg:text-base font-bold text-white">Company Information</h2>
              </div>

              <div className="p-4 lg:p-5 space-y-3 lg:space-y-4">
                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <User className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Supervisor Name
                  </label>
                  <input
                    type="text"
                    name="supervisorName"
                    value={profileData.supervisorName}
                    onChange={handleProfileChange}
                    className={`w-full px-3 lg:px-4 py-2 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                    disabled={loading}
                    placeholder="Enter supervisor name"
                  />
                </div>

                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Building className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleProfileChange}
                    className={`w-full px-3 lg:px-4 py-2 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                    disabled={loading}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-1 lg:space-y-2">
                  <label className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-700">
                    <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                    Nature of Business
                  </label>
                  <input
                    type="text"
                    name="natureOfBusiness"
                    value={profileData.natureOfBusiness}
                    onChange={handleProfileChange}
                    className={`w-full px-3 lg:px-4 py-2 text-sm border-2 ${BORDER_COLOR} rounded-md ${INPUT_FOCUS_RING} transition-all`}
                    disabled={loading}
                    placeholder="Enter business nature"
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
                    className="w-full px-3 lg:px-4 py-2 text-sm border-2 border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    disabled
                    placeholder="Email (read-only)"
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

export default ProfileS;
