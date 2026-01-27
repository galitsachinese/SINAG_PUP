import { CheckCircle, Clock, Pencil, Search, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddIntern from './AddIntern';
import EditIntern from './EditIntern';
import Endorsement from './Endorsement';

/* =========================
   ENVIRONMENT CONFIGURATION
========================= */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* =========================
   HELPER: GET ADVISER PROGRAM
========================= */
const getAdviserProgramFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.program?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
};

/* =========================
   STATUS ICONS
========================= */
const StatusIcons = ({ intern, onApprove, onPending, onDecline }) => {
  return (
    <div className="flex justify-center gap-3">
      <button
        title="Pending"
        onClick={() => onPending(intern)}
        className={`${intern.status === 'Pending' ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
      >
        <Clock size={18} />
      </button>

      <button
        title="Approved"
        onClick={() => onApprove(intern)}
        className={`${intern.status === 'Approved' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
      >
        <CheckCircle size={18} />
      </button>

      <button
        title="Declined"
        onClick={() => onDecline(intern)}
        className={`${intern.status === 'Declined' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
      >
        <XCircle size={18} />
      </button>
    </div>
  );
};

/* =========================
   INTERN A
========================= */
const InternA = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInternForm, setShowAddInternForm] = useState(false);
  const [internForEndorsement, setInternForEndorsement] = useState(null);

  /* EDIT */
  const [showEditInternForm, setShowEditInternForm] = useState(false);
  const [internToEdit, setInternToEdit] = useState(null);

  /* DELETE */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [internToDelete, setInternToDelete] = useState(null);

  /* DECLINE */
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [internToDecline, setInternToDecline] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  /* =========================
     FETCH INTERNS
  ========================= */
  useEffect(() => {
    const fetchInterns = async () => {
      setLoading(true);
      setError(null);

      try {
        const adviserProgram = getAdviserProgramFromToken();
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }

        console.log('🔗 API URL:', API_BASE_URL);
        console.log('🔗 Fetching from:', `${API_BASE_URL}/api/auth/interns`);

        const res = await fetch(`${API_BASE_URL}/api/auth/interns`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Response status:', res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`Failed to fetch interns: ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ Fetched data:', data);

        const normalized = data
          .filter((i) => (adviserProgram ? i.User?.program?.toLowerCase() === adviserProgram : true))
          .filter((i) =>
            searchTerm
              ? `${i.User.firstName} ${i.User.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
              : true,
          )
          .map((i) => {
            const d = i.InternDocuments?.[0] || {};

            const file = (f) => (f ? `${API_BASE_URL}/uploads/${f}` : null);

            return {
              id: i.id,
              studNo: i.User.studentId,
              lastname: i.User.lastName,
              firstname: i.User.firstName,
              mi: i.User.mi || '',
              email: i.User.email,
              program: i.User.program,

              // 📄 DOCUMENTS
              consentForm: file(d.consent_form),
              notarizedAgreement: file(d.notarized_agreement),
              portfolio: file(d.portfolio),
              resume: file(d.resume),
              cor: file(d.cor),
              insurance: file(d.insurance),
              medical: file(d.medical_cert),

              status: i.status,
              remarks: i.remarks,
            };
          });

        setInterns(normalized);
      } catch (err) {
        console.error('❌ Error:', err.message);
        setError(err.message || 'Failed to load intern documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();
  }, [searchTerm]);

  /* =========================
     HELPERS
  ========================= */

  const getFileName = (url) => {
    if (!url) return '';
    return decodeURIComponent(url.split('/').pop());
  };

  /* =========================
     STATUS HANDLERS
  ========================= */
  const handleApprove = async (intern) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/auth/interns/${intern.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Approved' }),
      });

      if (!res.ok) throw new Error('Approval failed');

      setInternForEndorsement({
        ...intern,
        status: 'Approved',
      });

      setInterns((prev) => prev.map((i) => (i.id === intern.id ? { ...i, status: 'Approved' } : i)));
    } catch (err) {
      console.error(err);
      alert('Failed to approve intern');
    }
  };

  const handlePending = async (intern) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/auth/interns/${intern.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Pending' }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setInterns((prev) => prev.map((i) => (i.id === intern.id ? { ...i, status: 'Pending' } : i)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleDecline = (intern) => {
    setInternToDecline(intern);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleEditClick = (intern) => {
    setInternToEdit(intern);
    setShowEditInternForm(true);
  };

  const handleDeleteClick = (intern) => {
    setInternToDelete(intern);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/auth/interns/${internToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Delete failed');

      setInterns((prev) => prev.filter((i) => i.id !== internToDelete.id));
      setShowDeleteConfirm(false);
      setInternToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete intern');
    }
  };

  const submitDecline = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/auth/interns/${internToDecline.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Declined',
          remarks: declineReason,
        }),
      });

      if (!res.ok) throw new Error('Decline failed');

      setInterns((prev) =>
        prev.map((i) => (i.id === internToDecline.id ? { ...i, status: 'Declined', remarks: declineReason } : i)),
      );

      setShowDeclineModal(false);
      setDeclineReason('');
      setInternToDecline(null);
    } catch (err) {
      console.error(err);
      alert('Failed to decline intern');
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Intern Documents</h1>
              <p className="text-sm text-gray-600 mb-0.5">Review intern submission documents</p>
              <p className="text-xs text-gray-500">{interns.length} total interns</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowAddInternForm(true)}
              className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base whitespace-nowrap transform hover:-translate-y-0.5"
            >
              + Add Intern
            </button>

            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search intern name..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">⚠️ Error loading interns:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading interns...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && interns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-red-800">
              <tr>
                {[
                  'Actions',
                  'Stud No',
                  'Lastname',
                  'Firstname',
                  'MI',
                  'Consent Form',
                  'Notarized Agreement',
                  'Portfolio',
                  'Resume',
                  'COR',
                  'Insurance',
                  'Medical',
                  'Status',
                ].map((h, i) => (
                  <th key={i} className="px-6 py-3 text-xs font-bold text-white uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {interns.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEditClick(i)} className="text-blue-600 hover:text-blue-900">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(i)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4">{i.studNo}</td>
                  <td className="px-6 py-4">{i.lastname}</td>
                  <td className="px-6 py-4">{i.firstname}</td>
                  <td className="px-6 py-4">{i.mi}</td>

                  {['consentForm', 'notarizedAgreement', 'portfolio', 'resume', 'cor', 'insurance', 'medical'].map(
                    (d) => (
                      <td key={d} className="px-6 py-4">
                        {i[d] ? (
                          <a
                            href={i[d]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                            title={getFileName(i[d])}
                          >
                            {getFileName(i[d])}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    ),
                  )}

                  <td className="px-6 py-4">
                    <StatusIcons
                      intern={i}
                      onApprove={handleApprove}
                      onPending={handlePending}
                      onDecline={handleDecline}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NO INTERNS */}
      {!loading && interns.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
          <p className="text-gray-600">No interns found.</p>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && internToDelete && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-red-900 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold text-yellow-500 mb-4">Delete Intern</h2>

            <p className="text-white mb-4">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {internToDelete.firstname} {internToDelete.lastname}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-yellow-500 rounded-md text-black font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE MODAL */}
      {showDeclineModal && internToDecline && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-red-900 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold text-yellow-500 mb-4">
              Reason for Declining {internToDecline.firstname} {internToDecline.lastname}
            </h2>

            <textarea
              className="w-full p-2 bg-gray-200 rounded-md text-sm mb-4"
              rows={4}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeclineModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button
                disabled={!declineReason.trim()}
                onClick={submitDecline}
                className="px-4 py-2 bg-yellow-500 rounded-md disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT / ENDORSEMENT */}
      {showAddInternForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <AddIntern onAddSuccess={() => setShowAddInternForm(false)} onCancel={() => setShowAddInternForm(false)} />
        </div>
      )}

      {showEditInternForm && internToEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
            <EditIntern
              intern={internToEdit}
              onUpdate={(updatedIntern) => {
                setInterns((prev) => prev.map((i) => (i.id === updatedIntern.id ? updatedIntern : i)));
                setShowEditInternForm(false);
              }}
              onCancel={() => setShowEditInternForm(false)}
            />
          </div>
        </div>
      )}

      {internForEndorsement && (
        <Endorsement intern={internForEndorsement} onClose={() => setInternForEndorsement(null)} />
      )}
    </div>
  );
};

export default InternA;
