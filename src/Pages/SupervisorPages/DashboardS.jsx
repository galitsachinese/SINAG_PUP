import { ClipboardList, Download, FileText, Notebook, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoaWarningModal from '../../Components/MoaWarningModal';
import PasswordChangeReminderModal from '../../Components/PasswordChangeReminderModal';
import SupervisorReportModal from '../../Components/SupervisorReportModal';

/* =========================
   SIMPLE MODAL (UNCHANGED)
========================= */
const SimpleModal = ({ isVisible, title, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-t-4 border-red-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   COMPANY DASHBOARD
========================= */
const CompanyDashboard = () => {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [activeInterns, setActiveInterns] = useState([]);
  const [moaDetails, setMoaDetails] = useState({
    expiration: '',
    status: '',
    moaFile: null,
    supervisorName: '',
  });
  const [showMoaWarning, setShowMoaWarning] = useState(false);
  const [showPasswordReminder, setShowPasswordReminder] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState({
    isVisible: false,
    title: '',
    message: '',
  });

  const [reportModal, setReportModal] = useState({
    isVisible: false,
    intern: null,
  });

  const [dateModal, setDateModal] = useState({
    isVisible: false,
    selectedDate: new Date().toISOString().split('T')[0],
  });

  const showMessage = (title, message) => {
    setModal({ isVisible: true, title, message });
  };

  const closeModal = () => {
    setModal({ isVisible: false, title: '', message: '' });
  };

  const handleViewDailyLogs = (intern) => {
    setReportModal({ isVisible: true, intern });
  };

  const closeReportModal = () => {
    setReportModal({ isVisible: false, intern: null });
  };

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        /* 1️⃣ COMPANY PROFILE */
        const companyRes = await fetch('http://localhost:5000/api/auth/company/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!companyRes.ok) throw new Error('Failed to load company');

        const company = await companyRes.json();

        setCompanyName(company.name);

        // Format date with month as text
        const formatDate = (dateString) => {
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          return date.toLocaleDateString('en-US', options);
        };

        // Calculate MOA status
        const calculateMoaStatus = (moaEnd) => {
          if (!moaEnd) return 'N/A';

          const today = new Date();
          const endDate = new Date(moaEnd);
          const daysLeft = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));

          if (daysLeft < 0) {
            return 'Expired';
          } else if (daysLeft <= 30) {
            return 'Warning';
          } else {
            return 'Active';
          }
        };

        setMoaDetails({
          expiration: formatDate(company.moaEnd),
          status: calculateMoaStatus(company.moaEnd),
          moaFile: company.moaFile || null,
          supervisorName: company.supervisorName || 'N/A',
        });

        // Show warning popup if MOA is in Warning or Expired state
        // Only show once per login session
        const moaStatus = calculateMoaStatus(company.moaEnd);
        const hasShownWarning = sessionStorage.getItem('moaWarningShown');

        if ((moaStatus === 'Warning' || moaStatus === 'Expired') && !hasShownWarning) {
          setShowMoaWarning(true);
          sessionStorage.setItem('moaWarningShown', 'true');
        }

        // Check if password needs to be changed (first-time login)
        const hasShownPasswordReminder = sessionStorage.getItem('passwordReminderShown');
        if (company.forcePasswordChange && !hasShownPasswordReminder) {
          setShowPasswordReminder(true);
          sessionStorage.setItem('passwordReminderShown', 'true');
        }

        /* 2️⃣ INTERN LIST */
        const internRes = await fetch('http://localhost:5000/api/auth/company/interns', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!internRes.ok) throw new Error('Failed to load interns');

        const interns = await internRes.json();
        setActiveInterns(interns);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     INTERN EVALUATION
  ========================= */
  const handleViewEvaluation = (intern) => {
    navigate(`/pup-sinag/supervisor/evaluation/${intern.studentId}`);
  };

  /* =========================
     GENERATE DAILY ATTENDANCE
  ========================= */
  const handleGenerateAttendance = async () => {
    setDateModal({ ...dateModal, isVisible: true });
  };

  const handleConfirmGenerate = async () => {
    try {
      const selectedDate = dateModal.selectedDate;

      if (!selectedDate) {
        alert('Please select a date');
        return;
      }

      setDateModal({ ...dateModal, isVisible: false });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/dashboard/daily-attendance?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to generate report');
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DailyAttendance_${companyName.replace(/\s+/g, '_')}_${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Daily attendance report generated successfully!');
    } catch (error) {
      console.error('Error generating attendance:', error);
      alert('Failed to generate daily attendance report');
    }
  };

  /* =========================
     GENERATE GENERAL RECORD
  ========================= */
  const handleGenerateGeneralRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/dashboard/general-record`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to generate general record');
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GeneralRecord_${companyName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('General record generated successfully!');
    } catch (error) {
      console.error('Error generating general record:', error);
      alert('Failed to generate general record');
    }
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-xl text-red-800">Loading Company Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <SimpleModal isVisible={modal.isVisible} title={modal.title} message={modal.message} onClose={closeModal} />
      <SupervisorReportModal isOpen={reportModal.isVisible} onClose={closeReportModal} intern={reportModal.intern} />

      {/* Date Selection Modal */}
      {dateModal.isVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Red Header */}
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Select Date for Attendance</h3>
                <p className="text-red-100 text-sm">Generate daily attendance report</p>
              </div>
              <button
                onClick={() => setDateModal({ ...dateModal, isVisible: false })}
                className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* White Body */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={dateModal.selectedDate}
                  onChange={(e) => setDateModal({ ...dateModal, selectedDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will generate a report for all interns who logged time in/out on this date.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDateModal({ ...dateModal, isVisible: false })}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmGenerate}
                  className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-lg hover:from-red-900 hover:to-red-800 transition-all"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOA Warning Modal */}
      <MoaWarningModal
        isVisible={showMoaWarning}
        onClose={() => setShowMoaWarning(false)}
        warnings={moaDetails}
        type="supervisor"
      />

      <div className="space-y-6 w-full">
        {/* Enhanced Header Card */}
        <div className="bg-gradient-to-r from-red-800 to-red-700 text-white p-5 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-3xl lg:text-4xl font-bold text-yellow-400">Hello {companyName}!</h2>
          <p className="text-white/80 text-sm mt-1">Manage your interns and track their progress</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          {/* LEFT COLUMN */}
          <div className="flex flex-col w-full lg:w-1/3 space-y-6">
            <div className="bg-gradient-to-br from-red-800 to-red-700 text-white p-6 rounded-xl shadow-lg text-center h-48 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">Active Interns</h3>
              <p className="text-6xl lg:text-7xl font-extrabold text-yellow-400">{activeInterns.length}</p>
              <p className="text-sm text-white/80 italic mt-2">Currently active</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-red-800 pb-2">MOA Details</h3>
              <div className="space-y-3 text-sm lg:text-base">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-gray-700 min-w-[120px]">Expiration:</span>
                  <span className="text-gray-600">{moaDetails.expiration}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-gray-700 min-w-[120px]">Supervisor:</span>
                  <span className="text-gray-600">{moaDetails.supervisorName}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-gray-700 min-w-[120px]">Status:</span>
                  <span
                    className={`font-semibold ${
                      moaDetails.status === 'Active'
                        ? 'text-green-600'
                        : moaDetails.status === 'Warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {moaDetails.status}
                  </span>
                </div>
              </div>

              {moaDetails.moaFile ? (
                <a
                  href={`http://localhost:5000/uploads/${moaDetails.moaFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-800 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg mt-4"
                >
                  <FileText className="h-5 w-5" />
                  VIEW MOA
                </a>
              ) : (
                <button
                  onClick={() => showMessage('MOA Document', 'No MOA has been uploaded yet.')}
                  className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed mt-4"
                >
                  NO MOA AVAILABLE
                </button>
              )}
            </div>

            {/* Daily Attendance Report Button */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-red-800 pb-2">Generate Reports</h3>

              {/* Daily Attendance Button */}
              <button
                onClick={handleGenerateAttendance}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Download className="h-5 w-5" />
                DAILY ATTENDANCE
              </button>

              {/* General Record Button */}
              <button
                onClick={handleGenerateGeneralRecord}
                className="w-full mt-3 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FileText className="h-5 w-5" />
                GENERAL RECORD
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-red-800 to-red-700">
                  <tr>
                    {['STUD. NO.', 'LASTNAME', 'FIRSTNAME', 'MI.', 'EMAIL', 'DAILY LOGS', 'EVALUATION'].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {activeInterns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No active interns at the moment
                      </td>
                    </tr>
                  ) : (
                    activeInterns.map((intern) => (
                      <tr key={intern.studentId} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{intern.studentId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{intern.lastName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{intern.firstName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{intern.mi}</td>
                        <td className="px-6 py-4 text-sm">
                          <a
                            href={`mailto:${intern.email}`}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                          >
                            {intern.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewDailyLogs(intern)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                            title="View Daily Logs"
                          >
                            <Notebook className="h-6 w-6 mx-auto" />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleViewEvaluation(intern)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                            title="View Evaluation"
                          >
                            <ClipboardList className="h-6 w-6 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Reminder Modal */}
      <PasswordChangeReminderModal
        isVisible={showPasswordReminder}
        onClose={() => setShowPasswordReminder(false)}
        userRole="supervisor"
      />
    </div>
  );
};

export default CompanyDashboard;
