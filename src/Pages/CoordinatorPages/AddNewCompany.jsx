import { useEffect, useState } from 'react';

const AddNewCompany = ({ onAddSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    supervisorName: '',
    address: '',
    natureOfBusiness: '',
    moaStart: '',
    moaEnd: '',
    moaFile: null,
    initialPassword: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     HANDLE INPUT CHANGE
     AUTO CAPS (EXCEPT EMAIL)
  ========================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // File input
    if (name === 'moaFile') {
      setFormData((prev) => ({ ...prev, moaFile: files[0] }));
      return;
    }

    // Fields to auto-uppercase
    const upperFields = ['name', 'supervisorName', 'address', 'natureOfBusiness'];

    setFormData((prev) => ({
      ...prev,
      [name]: upperFields.includes(name) ? value.toUpperCase() : value,
    }));
  };

  /* =========================
     AUTO-GENERATE PASSWORD
     HTE_NAME_YEAR
  ========================= */
  useEffect(() => {
    if (formData.name) {
      const year = new Date().getFullYear();
      const safeName = formData.name.replace(/\s+/g, '');
      setFormData((prev) => ({
        ...prev,
        initialPassword: `${safeName}_${year}`,
      }));
    }
  }, [formData.name]);

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.supervisorName ||
      !formData.address ||
      !formData.natureOfBusiness ||
      !formData.moaStart ||
      !formData.moaEnd ||
      !formData.moaFile ||
      !formData.initialPassword
    ) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/auth/addCompany', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to add company');
      }

      const company = await res.json();
      onAddSuccess && onAddSuccess(company);
      alert('New Company added successfully!');

      setFormData({
        name: '',
        email: '',
        supervisorName: '',
        address: '',
        natureOfBusiness: '',
        moaStart: '',
        moaEnd: '',
        moaFile: null,
        initialPassword: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to add new company.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Add New HTE (Host Training Establishment)</h2>
          <p className="text-red-100 text-sm mt-1">Fill in the details below to add a new HTE to the system</p>
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
          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name of HTE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Supervisor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nature of Business <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="natureOfBusiness"
                value={formData.natureOfBusiness}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  MOA Start <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="moaStart"
                  value={formData.moaStart}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  MOA End <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="moaEnd"
                  value={formData.moaEnd}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* MOA FILE */}
            <div>
              <label
                htmlFor="moaFile"
                className="cursor-pointer font-bold border border-red-900 px-6 py-2 rounded-md inline-block"
              >
                Upload MOA (PDF) <span className="text-red-300">*</span>
              </label>
              <input
                id="moaFile"
                type="file"
                name="moaFile"
                accept="application/pdf"
                onChange={handleChange}
                className="hidden"
              />
              {formData.moaFile && <p className="mt-2 text-sm text-green-600">Selected: {formData.moaFile.name}</p>}
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.initialPassword}
                readOnly
                className="w-full px-4 py-2 border rounded-md bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-2 text-sm text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs italic text-gray-500 mt-1">Auto-generated from HTE name and current year</p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-60"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {submitting ? 'Adding...' : 'Add New Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewCompany;
