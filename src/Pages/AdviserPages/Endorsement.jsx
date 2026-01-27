// Endorsement.jsx
import { useEffect, useState } from 'react';

const Endorsement = ({ intern, onClose }) => {
  /* =========================
     STATE
  ========================= */
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [hrName, setHrName] = useState('');
  const [position, setPosition] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!intern) return null;

  /* =========================
     INTERN NAME
  ========================= */
  const internFullName =
    intern?.firstname && intern?.lastname
      ? `${intern.firstname} ${intern.lastname}`
      : intern?.User?.firstName && intern?.User?.lastName
        ? `${intern.User.firstName} ${intern.User.lastName}`
        : 'Selected Intern';

  /* =========================
     FETCH COMPANIES (HTE)
  ========================= */
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/HTE', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch companies');

        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

  /* =========================
     HANDLE COMPANY SELECT
  ========================= */
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);

    const selected = companies.find((c) => String(c.id) === companyId);

    if (selected) {
      setCompanyName(selected.name || '');
      setCompanyAddress(selected.address || '');
      setHrName(selected.supervisorName || '');
    }
  };

  /* =========================
     SAVE TO DB (NO PDF)
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompanyId || !position) {
      setErrorMessage('⚠ Please fill out all required fields.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/interns/${intern.id}/assign-hte`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          position,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      alert('✅ HTE successfully assigned');
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('❌ Failed to save endorsement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Assign Host Training Establishment</h2>
            <p className="text-red-100 text-sm mt-1">
              Placement for: <span className="font-semibold">{internFullName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 rounded-full p-2 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* COMPANY DROPDOWN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Company / HTE</label>
              <select
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* COMPANY NAME (READ ONLY) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
              <input
                value={companyName}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Address</label>
              <input
                value={companyAddress}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* HR */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HR / Supervisor</label>
              <input
                value={hrName}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* POSITION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Intern Position</label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
                <div className="text-red-700 text-sm flex-1">{errorMessage}</div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all shadow-md hover:shadow-lg"
              >
                Save Assignment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Endorsement;
