import { useState } from 'react';

const UpdateHTE = ({ company, onCancel, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: company.name || '',
    email: company.email || '',
    supervisorName: company.supervisorName || '',
    address: company.address || '',
    natureOfBusiness: company.natureOfBusiness || '',
    moaStart: company.moaStart || '',
    moaEnd: company.moaEnd || '',
    moaFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     HANDLE CHANGE
     AUTO CAPS (EXCEPT EMAIL)
  ========================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'moaFile') {
      setFormData((prev) => ({ ...prev, moaFile: files[0] }));
      return;
    }

    const uppercaseFields = ['name', 'supervisorName', 'address', 'natureOfBusiness'];

    setFormData((prev) => ({
      ...prev,
      [name]: uppercaseFields.includes(name) ? value.toUpperCase() : value,
    }));
  };

  /* =========================
     SUBMIT UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.moaStart || !formData.moaEnd) {
      setError('MOA start and end dates are required.');
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) payload.append(key, value);
      });

      const res = await fetch(`http://localhost:5000/api/auth/HTE/${company.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: payload,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update HTE');
      }

      const updatedCompany = await res.json();
      onUpdateSuccess(updatedCompany);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit HTE & MOA Details</h2>
          <p className="text-red-100 text-sm mt-1">{company.name}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-white hover:bg-red-600 rounded-full p-2 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="overflow-y-auto flex-1 px-8 py-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HTE Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor</label>
              <input
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* ADDRESS & NATURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nature of Business</label>
              <input
                name="natureOfBusiness"
                value={formData.natureOfBusiness}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* MOA DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MOA Start <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="moaStart"
                value={formData.moaStart}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MOA End <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="moaEnd"
                value={formData.moaEnd}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* MOA FILE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload New MOA (PDF)</label>
            <input
              type="file"
              name="moaFile"
              accept="application/pdf"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">Leave empty to keep current MOA.</p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateHTE;
