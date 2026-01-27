import {
  AlertCircle,
  BookOpen,
  Camera,
  CheckCircle2,
  CheckSquare,
  Clock,
  Lightbulb,
  MessageSquare,
  Timer,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const AdviserReportModal = ({ isOpen, onClose, intern }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentingReportId, setCommentingReportId] = useState(null);
  const [adviserComment, setAdviserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // ✅ Use environment variable or config for API URL
  const API_BASE_URL = 'http://localhost:5000';

  // Helper function to format time to 12-hour format with AM/PM
  const formatTime = (time24) => {
    if (!time24) return '-';

    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    hour = hour ? hour : 12; // 0 should be 12

    return `${hour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (isOpen && intern) {
      fetchInternReports();
    }
  }, [isOpen, intern]);

  const fetchInternReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      console.log('📌 Intern object:', intern);
      console.log('📌 Intern ID:', intern?.id);

      const internId = intern?.id || intern?.intern_id || intern?.user_id;

      if (!internId) {
        setError('Invalid intern ID - unable to determine intern ID from object');
        console.error('Missing intern ID. Intern object:', intern);
        return;
      }

      const apiUrl = `${API_BASE_URL}/api/daily-logs/${internId}`;
      console.log('🔗 Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📊 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched reports:', data);

        // Sort by log_date in descending order (newest first)
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.log_date) - new Date(a.log_date)) : [];

        setReports(sorted);
      } else {
        const errorData = await response.text();
        setError(`Failed to fetch reports: ${response.status} - ${errorData}`);
        console.error('❌ Failed response:', response.status, errorData);
      }
    } catch (error) {
      setError(`Error fetching reports: ${error.message}`);
      console.error('❌ Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId, status, comment = '') => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const finalComment = comment || `Approved by Adviser on ${new Date().toLocaleDateString()}`;

      const response = await fetch(`${API_BASE_URL}/api/daily-logs/${reportId}/adviser-approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adviser_status: status,
          adviser_comment: finalComment,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setReports(reports.map((r) => (r.id === reportId ? updatedLog.log : r)));
        setCommentingReportId(null);
        setAdviserComment('');
        console.log('✅ Report approved successfully');
      } else {
        console.error('❌ Error approving report:', response.status);
        setError('Failed to approve report');
      }
    } catch (error) {
      console.error('❌ Error approving report:', error);
      setError('Error approving report');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = (report) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 10;

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DAILY REPORT OF ACTIVITIES', pageWidth / 2, yPosition, {
        align: 'center',
      });

      yPosition += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Student Info
      doc.text(`Student: ${intern.firstname} ${intern.lastname}`, 10, yPosition);
      yPosition += 7;
      doc.text(`Student No.: ${intern.studNo}`, 10, yPosition);
      yPosition += 7;
      doc.text(`Date: ${report.log_date}`, 10, yPosition);
      yPosition += 7;
      doc.text(`Day No.: ${report.day_no}`, 10, yPosition);

      yPosition += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Time Report:', 10, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Time In: ${formatTime(report.time_in)}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Time Out: ${formatTime(report.time_out)}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Total Hours: ${report.total_hours} hours`, 15, yPosition);

      yPosition += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Tasks Accomplished:', 10, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      const taskLines = doc.splitTextToSize(report.tasks_accomplished, pageWidth - 20);
      doc.text(taskLines, 10, yPosition);
      yPosition += taskLines.length * 5 + 5;

      if (report.skills_enhanced) {
        doc.setFont('helvetica', 'bold');
        doc.text('Skills Enhanced:', 10, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        const skillLines = doc.splitTextToSize(report.skills_enhanced, pageWidth - 20);
        doc.text(skillLines, 10, yPosition);
        yPosition += skillLines.length * 5 + 5;
      }

      if (report.learning_applied) {
        doc.setFont('helvetica', 'bold');
        doc.text('Learning Applied:', 10, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        const learningLines = doc.splitTextToSize(report.learning_applied, pageWidth - 20);
        doc.text(learningLines, 10, yPosition);
      }

      // Footer
      yPosition = pageHeight - 15;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

      doc.save(`Daily_Report_Day_${report.day_no}_${intern.studNo}.pdf`);
      console.log('✅ PDF generated successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  const generateEndorsement = (report) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      const internName = `${intern.firstname || ''} ${intern.lastname || ''}`.trim() || 'Student';
      const studentNo = intern.studNo || 'N/A';
      const program = intern.program || intern.course || 'Program';
      const today = new Date().toLocaleDateString();
      const totalHours = Array.isArray(reports)
        ? reports.reduce((sum, r) => sum + (Number(r.total_hours) || 0), 0)
        : report?.total_hours || 0;
      const lastDay = report?.day_no || 'N/A';
      const lastDate = report?.log_date || 'N/A';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('ENDORSEMENT LETTER', pageWidth / 2, y, { align: 'center' });

      y += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${today}`, 20, y);

      y += 15;
      doc.text('To Whom It May Concern,', 20, y);

      y += 12;
      const body = [
        `This is to formally endorse ${internName} (Student No.: ${studentNo}), currently enrolled in ${program}, for on-the-job training/practicum placement/continuation.`,
        `Based on submitted daily activity reports up to Day ${lastDay} dated ${lastDate}, the student has recorded a cumulative ${totalHours} training hours.`,
        'The student remains in good standing and is recommended to proceed with industry engagement to further develop practical skills and professional readiness.',
        'We request your consideration and support for hosting the student during the required training period.',
      ];

      const bodyLines = doc.splitTextToSize(body.join(' '), pageWidth - 40);
      doc.text(bodyLines, 20, y);

      y += bodyLines.length * 6 + 12;
      doc.text('Thank you for your support.', 20, y);

      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.text('Adviser', 20, y);

      doc.save(`Endorsement_${studentNo || 'student'}_Day${lastDay}.pdf`);
      console.log('✅ Endorsement PDF generated');
    } catch (err) {
      console.error('❌ Error generating endorsement PDF:', err);
      setError('Failed to generate endorsement');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-x-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white px-8 py-6 flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-2xl font-bold">
              {intern?.firstname || 'Unknown'} {intern?.lastname || 'Student'}
            </h2>
            <p className="text-red-100 text-base mt-1">
              Daily Activity Reports \u00b7 Student ID: {intern?.studNo || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 rounded-full p-2 transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-500" />
              <div className="text-red-700 text-base">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <AlertCircle size={48} className="text-gray-300" />
              <p className="text-gray-500 text-lg">No reports submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                >
                  {/* REPORT HEADER */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-slate-900 mb-3">
                        Day {report.day_no} -{' '}
                        {new Date(report.log_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-1.5 text-base text-slate-600">
                          <Clock size={18} />
                          {formatTime(report.time_in)} - {formatTime(report.time_out)}
                        </span>
                        <span className="font-bold text-[#800000] flex items-center gap-1.5 text-base">
                          <Timer size={18} />
                          Total Hours: <span className="text-xl ml-1">{report.total_hours}</span> hrs
                        </span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-3">
                      {/* APPROVAL STATUS */}
                      {report.adviser_status === 'Pending' ? (
                        <>
                          <span className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-amber-300 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                            <Clock size={16} /> PENDING
                          </span>
                          <button
                            onClick={() => {
                              setCommentingReportId(report.id);
                              setAdviserComment('');
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap"
                          >
                            <CheckCircle2 size={18} />
                            Approve
                          </button>
                        </>
                      ) : report.adviser_status === 'Approved' ? (
                        <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-green-300 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                          <CheckCircle2 size={16} /> APPROVED
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-red-100 to-red-50 text-red-800 px-4 py-2 rounded-full text-sm font-bold border-2 border-red-300 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                          <AlertCircle size={16} /> REJECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* COMMENT INPUT SECTION */}
                  {commentingReportId === report.id && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-in slide-in-from-top duration-300">
                      <label className="font-bold text-gray-800 text-base block mb-3 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-600" /> Add Adviser Comment:
                      </label>
                      <textarea
                        value={adviserComment}
                        onChange={(e) => setAdviserComment(e.target.value)}
                        placeholder="Enter your feedback for this daily log (optional)..."
                        className="w-full p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none leading-relaxed"
                        rows="4"
                        disabled={submitting}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleApprove(report.id, 'Approved', adviserComment)}
                          disabled={submitting}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 size={18} />
                          {submitting ? 'Submitting...' : 'Submit Approval'}
                        </button>
                        <button
                          onClick={() => {
                            setCommentingReportId(null);
                            setAdviserComment('');
                          }}
                          disabled={submitting}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DIVIDER */}
                  <div className="border-t-2 border-gray-200 mb-6"></div>

                  {/* REPORT DETAILS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - TEXT DETAILS */}
                    <div className="space-y-5 lg:col-span-2">
                      {/* Tasks Accomplished */}
                      <div>
                        <label className="font-bold text-gray-800 text-base block mb-2 flex items-center gap-2">
                          <CheckSquare size={18} className="text-gray-600" /> Tasks Accomplished:
                        </label>
                        <p className="text-gray-700 text-base whitespace-pre-wrap bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm leading-relaxed">
                          {report.tasks_accomplished || 'No tasks recorded'}
                        </p>
                      </div>

                      {/* Skills Enhanced */}
                      {report.skills_enhanced && (
                        <div>
                          <label className="font-bold text-gray-800 text-base block mb-2 flex items-center gap-2">
                            <Lightbulb size={18} className="text-blue-600" /> Skills Enhanced:
                          </label>
                          <p className="text-gray-700 text-base whitespace-pre-wrap bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200 shadow-sm leading-relaxed">
                            {report.skills_enhanced}
                          </p>
                        </div>
                      )}

                      {/* Learning Applied */}
                      {report.learning_applied && (
                        <div>
                          <label className="font-bold text-gray-800 text-base block mb-2 flex items-center gap-2">
                            <BookOpen size={18} className="text-purple-600" /> Learning Applied:
                          </label>
                          <p className="text-gray-700 text-base whitespace-pre-wrap bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200 shadow-sm leading-relaxed">
                            {report.learning_applied}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN - PHOTO */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                        <Camera size={18} className="text-gray-600" /> Uploaded Photo:
                      </label>
                      {report.photo_path ? (
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-4 shadow-inner min-h-[200px]">
                          <img
                            src={`${API_BASE_URL}/uploads/${report.photo_path}`}
                            alt={`Day ${report.day_no} photo`}
                            className="w-full h-auto rounded-lg shadow-lg max-h-72 object-contain transition-transform duration-300 hover:scale-105 cursor-pointer"
                            onClick={() => setLightboxPhoto(`${API_BASE_URL}/uploads/${report.photo_path}`)}
                            onLoad={() => console.log('✅ Image loaded successfully:', report.photo_path)}
                            onError={(e) => {
                              console.error('❌ Image load failed');
                              console.error('   Photo path:', report.photo_path);
                              console.error('   URL attempted:', e.target.src);
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8 min-h-[200px]">
                          <Camera size={48} className="text-gray-300 mb-3" />
                          <p className="text-gray-500 text-base font-medium">No photo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ADVISER COMMENT */}
                  {report.adviser_comment && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                      <label className="font-bold text-gray-800 text-base block mb-3 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-600" /> Adviser Comment:
                      </label>
                      <p className="text-gray-700 text-base bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-300 shadow-sm leading-relaxed">
                        {report.adviser_comment}
                      </p>
                      <p className="text-gray-500 text-sm italic mt-2">
                        Approved on{' '}
                        {new Date(report.updated_at || report.created_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PHOTO LIGHTBOX */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-3 transition-colors z-10"
            aria-label="Close photo"
          >
            <X size={32} />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] flex items-center justify-center">
            <img
              src={lightboxPhoto}
              alt="Full size view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="absolute bottom-6 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            Click anywhere to close
          </p>
        </div>
      )}
    </div>
  );
};

export default AdviserReportModal;
