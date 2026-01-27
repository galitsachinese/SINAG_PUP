import { CheckCircle2, CloudUpload, Eye, FileText, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../Components/Modal';
import ConsentForm from '../../Forms/ConsentForm';
import NotarizedAgreementForm from '../../Forms/NotarizedAgreementForm';

const DOCUMENTS = [
  { label: 'Consent Form', column: 'consent_form' },
  { label: 'Notarized Agreement', column: 'notarized_agreement' },
  { label: 'MOA', column: 'MOA' },
  { label: 'Resume', column: 'resume' },
  { label: 'Certificate of Registration (COR)', column: 'cor' },
  { label: 'Insurance', column: 'insurance' },
  { label: 'Medical Certificate', column: 'medical_cert' },
];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputsRef = useRef([]);
  const navigate = useNavigate();
  const [showFillForm, setShowFillForm] = useState(false);
  const [showNotarizedForm, setShowNotarizedForm] = useState(false);

  /* =========================
     FETCH DOCUMENT STATUS
  ========================= */
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
        console.error(err);
        alert('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  /* =========================
     FILE HANDLERS
  ========================= */
  const triggerFileSelect = (index) => {
    fileInputsRef.current[index]?.click();
  };

  /* =========================
     UPLOAD FILE
  ========================= */
  const handleFileChange = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('PDF files only');
      event.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('column', documents[index].column); // Send which document type this is

    try {
      const res = await fetch('http://localhost:5000/api/auth/intern-docs/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      const updated = [...documents];
      updated[index] = {
        ...updated[index],
        uploaded: true,
        file: data.file,
      };

      setDocuments(updated);
      alert('File uploaded successfully');
    } catch (err) {
      alert(err.message);
    } finally {
      event.target.value = null;
    }
  };

  const handleFileView = async (filename, isMOA = false) => {
    try {
      if (isMOA) {
        const res = await fetch('http://localhost:5000/api/auth/company/moa', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) {
          throw new Error(`MOA fetch failed: ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (index) => {
    const doc = documents[index];

    if (!window.confirm(`Delete ${doc.name}?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/intern-docs/${doc.column}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      const updated = [...documents];
      updated[index] = {
        ...updated[index],
        uploaded: false,
        file: null,
      };

      setDocuments(updated);
      alert('File deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  /* =========================
     UI
  ========================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex-shrink-0">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Document Dashboard</h1>
            <p className="text-red-100 text-base sm:text-lg mt-1">Upload and manage your required documents</p>
          </div>
        </div>
      </div>

      {/* File Upload Guide */}
      <div className="bg-red-50 border-l-4 border-red-800 rounded-lg p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">Important: File Naming</h3>
            <p className="text-sm text-red-800 font-medium">
              Name your files based on the document type in CAPSLOCK (e.g., COR.pdf, RESUME.pdf, MEDICAL.pdf)
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Document List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-gradient-to-r from-red-700 to-red-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <FileText className="text-white" size={28} />
            <h2 className="text-xl font-bold text-white">Required Documents</h2>
          </div>
        </div>

        <ul className="p-6 space-y-3">
          {documents.map((doc, index) => (
            <li
              key={doc.column}
              className="group bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-white transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {doc.uploaded ? (
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                  <span className="text-gray-800 font-semibold text-base truncate">{doc.name}</span>
                </div>

                {/* RIGHT */}
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  {doc.column !== 'MOA' && (
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      ref={(el) => (fileInputsRef.current[index] = el)}
                      onChange={(e) => handleFileChange(index, e)}
                    />
                  )}

                  {/* FILL CONSENT FORM */}
                  {(doc.column === 'consent_form' || doc.column === 'notarized_agreement') && (
                    <button
                      onClick={() =>
                        doc.column === 'consent_form' ? setShowFillForm(true) : setShowNotarizedForm(true)
                      }
                      className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      <FileText size={16} />
                      Fill Form
                    </button>
                  )}

                  {/* UPLOAD (INCLUDING CONSENT FORM) */}
                  {!doc.uploaded && doc.column !== 'MOA' && (
                    <button
                      onClick={() => triggerFileSelect(index)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      <CloudUpload size={16} />
                      Upload
                    </button>
                  )}

                  {/* DELETE */}
                  {doc.uploaded && doc.column !== 'MOA' && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      <XCircle size={16} />
                      Delete
                    </button>
                  )}

                  {/* VIEW */}
                  {doc.uploaded && (
                    <button
                      onClick={() => handleFileView(doc.file, doc.column === 'MOA')}
                      className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 px-4 py-2.5 rounded-lg font-medium transition-all"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CONSENT FORM MODAL */}
      {showFillForm && (
        <Modal isOpen={showFillForm} onClose={() => setShowFillForm(false)}>
          <ConsentForm
            onClose={() => setShowFillForm(false)}
            onUploaded={(file) => {
              setDocuments((prev) =>
                prev.map((d) => (d.column === 'consent_form' ? { ...d, uploaded: true, file } : d)),
              );
            }}
          />
        </Modal>
      )}

      {/* NOTARIZED AGREEMENT MODAL */}
      {showNotarizedForm && (
        <Modal isOpen={showNotarizedForm} onClose={() => setShowNotarizedForm(false)}>
          <NotarizedAgreementForm
            onClose={() => setShowNotarizedForm(false)}
            onUploaded={(file) => {
              setDocuments((prev) =>
                prev.map((d) => (d.column === 'notarized_agreement' ? { ...d, uploaded: true, file } : d)),
              );
            }}
          />
        </Modal>
      )}
    </div>
  );
};
export default Documents;
