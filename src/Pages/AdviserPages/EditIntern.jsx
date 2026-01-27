import { useEffect, useState } from 'react';

const EditIntern = ({ intern, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    mi: '',
    id: '',
    program: '',
    email: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     LOAD INTERN DATA
  ========================= */
  useEffect(() => {
    if (!intern) return;

    setFormData({
      lastname: intern.lastname || '',
      firstname: intern.firstname || '',
      mi: intern.mi || '',
      id: intern.studNo || '',
      program: intern.program || '',
      email: intern.email || '',
    });
  }, [intern]);

  /* =========================
     HANDLE INPUT
     - SAME RULES AS ADD INTERN
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Email stays normal
    if (name === 'email') {
      setFormData((prev) => ({ ...prev, email: value }));
      return;
    }

    // Student ID → CAPS
    if (name === 'id') {
      setFormData((prev) => ({ ...prev, id: value.toUpperCase() }));
      return;
    }

    // Others → CAPS
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  /* =========================
     SUBMIT UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lastname || !formData.firstname || !formData.id || !formData.email) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5000/api/auth/interns/${intern.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstname,
          lastName: formData.lastname,
          mi: formData.mi,
          studentId: formData.id,
          email: formData.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update intern');
      }

      const updated = await res.json();

      onUpdate({
        ...intern,
        ...updated,
        lastname: updated.lastName,
        firstname: updated.firstName,
        studNo: updated.studentId,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update intern.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden flex flex-col">
      {/* MODAL HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Intern Details</h2>
          <p className="text-red-100 text-sm mt-1">Update the intern information below</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:bg-red-600 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="overflow-y-auto flex-1 px-8 py-6">
        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" id="editInternForm">
          {/* --- First Row: Name Fields --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Initial</label>
              <input
                type="text"
                name="mi"
                value={formData.mi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* --- Second Row: ID and Email --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                required
              />
            </div>
          </div>

          {/* --- Third Row: Program (Full Width) --- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 shadow-sm text-sm">
              {formData.program || 'Not assigned'}
            </div>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Intern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIntern;
