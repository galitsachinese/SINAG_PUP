import { useState } from 'react';

const EditAdviser = ({ adviser, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: adviser.firstName || adviser.firstname || '',
    lastName: adviser.lastName || adviser.lastname || '',
    mi: adviser.mi || '',
    email: adviser.email || '',
    program: adviser.program || adviser.department || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* =========================
     HANDLE INPUT CHANGE
     - Uppercase names & program
     - Lowercase email
     - Trim leading spaces
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const upperCaseFields = ['firstName', 'lastName', 'mi', 'program'];

    setFormData((prev) => ({
      ...prev,
      [name]: upperCaseFields.includes(name)
        ? value.toUpperCase().replace(/^\s+/, '')
        : name === 'email'
          ? value.toLowerCase().replace(/\s+/g, '')
          : value,
    }));
  };

  /* =========================
     HANDLE SUBMIT
     - Trim all values
     - Force email lowercase
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mi: formData.mi.trim(),
        program: formData.program.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      const response = await fetch(`http://localhost:5000/api/auth/advisers/${adviser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update adviser');
      }

      const updatedAdviser = await response.json();
      onUpdate(updatedAdviser);
    } catch (err) {
      console.error('Edit adviser error:', err);
      setError(err.message || 'Failed to update adviser.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Adviser</h2>
          <p className="text-red-100 text-sm mt-1">Update adviser information</p>
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
          {/* NAME ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* MI & EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">M.I.</label>
              <input
                type="text"
                name="mi"
                value={formData.mi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* PROGRAM */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program / Department</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdviser;
