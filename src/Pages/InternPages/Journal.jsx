import { BookOpen, CheckCircle2, Clock, Download, Edit3, MessageSquare, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from '../../Components/Modal';
import UploadReport from './UploadReport';

const Journal = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState({ type: '', comment: '' });

  /* =========================
     FETCH DAILY LOGS
  ========================= */
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5173/api/daily-logs', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch logs:', response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Transform API data to match table structure
      const formattedReports = data.map((log) => {
        // Calculate total hours
        let totalHours = 0;
        if (log.time_in && log.time_out) {
          const [inH, inM] = log.time_in.split(':').map(Number);
          const [outH, outM] = log.time_out.split(':').map(Number);
          let start = inH * 60 + inM;
          let end = outH * 60 + outM;
          if (end < start) end += 24 * 60; // Handle overnight
          totalHours = ((end - start) / 60).toFixed(2);
        }

        return {
          id: log.id,
          dayNo: log.day_no,
          date: log.log_date,
          timeIn: log.time_in,
          timeOut: log.time_out,
          totalHours: totalHours,
          tasksAccomplished: log.tasks_accomplished,
          skillsEnhanced: log.skills_enhanced,
          learningApplied: log.learning_applied,
          supervisorPending: log.supervisor_status === 'Pending',
          supervisorApproved: log.supervisor_status === 'Approved',
          adviserPending: log.adviser_status === 'Pending',
          adviserApproved: log.adviser_status === 'Approved',
          supervisorComment: log.supervisor_comment,
          adviserComment: log.adviser_comment,
        };
      });

      setReports(formattedReports);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOAD LOGS ON MOUNT
  ========================= */
  useEffect(() => {
    fetchLogs();
  }, []);

  /* =========================
     HANDLE SUCCESSFUL UPLOAD
  ========================= */
  const handleUploadSuccess = () => {
    setShowUpload(false);
    setEditingReport(null);
    fetchLogs(); // Refresh the table
  };

  /* =========================
     ACTION HANDLERS
  ========================= */
  const handleDownload = (report) => {
    // TODO: Implement download functionality
    console.log('Download:', report);
    alert('Download functionality coming soon');
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setShowUpload(true);
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Are you sure you want to delete Day ${report.dayNo}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/daily-logs/${report.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('Daily log deleted successfully');
        fetchLogs(); // Refresh the table
      } else {
        alert(data.message || 'Failed to delete daily log');
      }
    } catch (error) {
      console.error('Error deleting daily log:', error);
      alert('An error occurred while deleting the daily log');
    }
  };

  const handleShowComment = (type, comment) => {
    if (comment) {
      setSelectedComment({ type, comment });
      setShowCommentModal(true);
    }
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex-shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Daily Activity Journal</h1>
              <p className="text-red-100 text-base sm:text-lg mt-1">Track and manage your daily internship reports</p>
              <p className="text-red-200 text-sm mt-1">{reports.length} total entries</p>
            </div>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="bg-white text-red-800 hover:bg-red-50 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Report
          </button>
        </div>
      </div>

      <Modal
        isOpen={showUpload}
        onClose={() => {
          setShowUpload(false);
          setEditingReport(null);
        }}
      >
        <UploadReport
          onUploadSuccess={handleUploadSuccess}
          editingReport={editingReport}
          onClose={() => {
            setShowUpload(false);
            setEditingReport(null);
          }}
        />
      </Modal>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-white" size={28} />
            <h2 className="text-xl font-bold text-white">Journal Entries</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Day No.</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Supervisor Approval
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Adviser Approval</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
                    </div>
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{report.dayNo}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 font-medium">
                        {report.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-50 text-red-800">
                        {report.totalHours} hrs
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Clock size={18} className={report.supervisorPending ? 'text-yellow-500' : 'text-gray-300'} />
                        <CheckCircle2
                          size={18}
                          className={report.supervisorApproved ? 'text-green-600' : 'text-gray-300'}
                        />
                        <MessageSquare
                          size={18}
                          className={`${report.supervisorComment ? 'text-blue-600 cursor-pointer hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                          title={report.supervisorComment ? 'Click to view comment' : 'No comment'}
                          onClick={() => handleShowComment('Supervisor', report.supervisorComment)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Clock size={18} className={report.adviserPending ? 'text-yellow-500' : 'text-gray-300'} />
                        <CheckCircle2
                          size={18}
                          className={report.adviserApproved ? 'text-green-600' : 'text-gray-300'}
                        />
                        <MessageSquare
                          size={18}
                          className={`${report.adviserComment ? 'text-blue-600 cursor-pointer hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                          title={report.adviserComment ? 'Click to view comment' : 'No comment'}
                          onClick={() => handleShowComment('Adviser', report.adviserComment)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(report)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Download log"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit log"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete log"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No daily logs yet. Click Upload to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Upload/Edit */}
      <Modal
        isOpen={showUpload}
        onClose={() => {
          setShowUpload(false);
          setEditingReport(null);
        }}
      >
        <UploadReport
          onUploadSuccess={handleUploadSuccess}
          editingReport={editingReport}
          onClose={() => {
            setShowUpload(false);
            setEditingReport(null);
          }}
        />
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-white" size={24} />
              <h3 className="text-xl font-bold text-white">{selectedComment.type} Comment</h3>
            </div>
            <button
              onClick={() => setShowCommentModal(false)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
          {/* Comment Content */}
          <div className="p-6">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[120px]">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {selectedComment.comment || 'No comment available.'}
              </p>
            </div>
          </div>
          {/* Footer */}
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={() => setShowCommentModal(false)}
              className="px-6 py-2.5 rounded-lg bg-gray-300 hover:bg-gray-400 font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Journal;
