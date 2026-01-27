import { Building2, Calendar, CheckCircle2, Eye, FileText, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PasswordChangeReminderModal from '../../Components/PasswordChangeReminderModal';

const HomeI = () => {
  // =========================
  // STATE
  // =========================
  const navigate = useNavigate();
  const location = useLocation();
  const [internData, setInternData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordReminder, setShowPasswordReminder] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Document definitions matching Documents.jsx
  const DOCUMENTS = [
    { label: 'Consent Form', column: 'consent_form' },
    { label: 'Notarized Agreement', column: 'notarized_agreement' },
    { label: 'MOA', column: 'MOA' },
    { label: 'Resume', column: 'resume' },
    { label: 'Certificate of Registration (COR)', column: 'cor' },
    { label: 'Insurance', column: 'insurance' },
    { label: 'Medical Certificate', column: 'medical_cert' },
  ];

  // =========================
  // FETCH DOCUMENTS DATA (same as Documents.jsx)
  // =========================
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/intern-docs/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();

        const mapped = DOCUMENTS.map((doc) => ({
          name: doc.label,
          column: doc.column,
          uploaded: Boolean(data?.[doc.column]),
          file: data?.[doc.column] || null,
        }));

        setDocuments(mapped);
      } catch (err) {
        console.error('❌ Failed to fetch documents:', err);
      }
    };

    fetchDocs();

    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDocs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location, refreshTrigger]);

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  useEffect(() => {
    const fetchInternDashboardData = async () => {
      try {
        console.log('🔄 Fetching dashboard data...', new Date().toISOString());
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        const [dashboardRes, userRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/intern', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashboardRes.ok) {
          throw new Error('Failed to fetch dashboard');
        }

        const data = await dashboardRes.json();
        const userData = await userRes.json();

        console.log('✅ Dashboard data fetched:', data);
        setInternData(data);

        // Check if password needs to be changed
        const hasShownPasswordReminder = sessionStorage.getItem('passwordReminderShown');
        if (userData.forcePasswordChange && !hasShownPasswordReminder) {
          setShowPasswordReminder(true);
          sessionStorage.setItem('passwordReminderShown', 'true');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInternDashboardData();

    // Listen for page visibility changes (when user switches tabs or navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is now visible, refresh data
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location, refreshTrigger]); // Re-fetch on route change or manual refresh trigger

  // =========================
  // HELPERS
  // =========================
  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600';
      case 'Approved':
        return 'text-green-600';
      case 'Declined':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    if (internData.status === 'Pending') {
      return 'Submit the documents and wait to be checked.';
    }

    if (internData.status === 'Approved') {
      return 'You are all set to go!';
    }

    if (internData.status === 'Declined') {
      return internData.remarks || 'Your application was declined.';
    }

    return '';
  };

  const handleFileView = (fileName) => {
    window.open(`http://localhost:5000/uploads/${fileName}`, '_blank');
  };

  // =========================
  // RENDER GUARDS
  // =========================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-800 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-md">
          <div className="flex items-center mb-2">
            <XCircle className="text-red-500 mr-2" size={24} />
            <h3 className="text-red-800 font-bold text-lg">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!internData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-4">
        <FileText className="text-gray-400 mb-4" size={64} />
        <p className="text-gray-600 text-lg">No dashboard data found</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* ENHANCED WELCOME BANNER */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex-shrink-0">
              <User className="text-white" size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome, {internData.firstName}!</h2>
              <p className="text-red-100 text-base sm:text-lg break-words">{internData.fullName}</p>
              <p className="text-red-200 text-sm mt-1">Student ID: {internData.studentId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INTERNSHIP DETAILS & APPLICATION STATUS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* Internship Details Section */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="text-white" size={24} />
              <h3 className="text-lg font-bold text-white">Internship Details</h3>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            {internData.companyDetails ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Company</p>
                  <p className="text-gray-800 font-semibold break-words">{internData.companyDetails.companyName}</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">Supervisor</p>
                  <p className="text-gray-800 font-semibold break-words">{internData.companyDetails.supervisor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                    <Calendar size={12} />
                    Start Date
                  </p>
                  <p className="text-gray-800 font-semibold">{internData.companyDetails.startDate}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 italic">No company assigned yet</p>
              </div>
            )}
          </div>

          {/* Application Status Section */}
          <div className="p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Application Status</h4>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="flex items-center gap-2">
                  {internData.status === 'Approved' && <CheckCircle2 className="text-green-600" size={28} />}
                  {internData.status === 'Pending' && <XCircle className="text-yellow-600" size={28} />}
                  {internData.status === 'Declined' && <XCircle className="text-red-600" size={28} />}
                  <p className={`font-bold text-2xl ${getStatusTextColor(internData.status)}`}>{internData.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-red-700">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{getStatusMessage()}</p>
            </div>
          </div>
        </div>

        {/* DOCUMENTS STATUS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-red-700 to-red-800 p-4">
            <div className="flex items-center gap-2">
              <FileText className="text-white" size={24} />
              <h5 className="text-lg font-bold text-white">Documents Status</h5>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {doc.uploaded ? (
                      <CheckCircle2 className="text-green-600 flex-shrink-0" size={22} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0" size={22} />
                    )}
                    <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                        doc.uploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {doc.uploaded ? 'Uploaded' : 'Pending'}
                    </span>
                    {doc.uploaded && (
                      <button
                        onClick={() => handleFileView(doc.file)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Document"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Reminder Modal */}
      <PasswordChangeReminderModal
        isVisible={showPasswordReminder}
        onClose={() => setShowPasswordReminder(false)}
        userRole="intern"
      />
    </div>
  );
};

export default HomeI;
