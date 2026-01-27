import { useEffect, useState } from 'react';

const AddAdviser = ({ onAddSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    mi: '',
    program: '',
    email: '',
    initialPassword: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     HANDLE INPUT CHANGE
     (AUTO-UPPERCASE)
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const uppercaseFields = ['lastname', 'firstname', 'mi', 'program'];

    setFormData((prev) => ({
      ...prev,
      [name]: uppercaseFields.includes(name) ? value.toUpperCase() : value,
    }));
  };

  /* =========================
     AUTO-GENERATE PASSWORD
     LASTNAME_PROGRAM_YEAR
  ========================= */
  useEffect(() => {
    if (formData.lastname) {
      const year = new Date().getFullYear();

      const safeLastName = formData.lastname.replace(/\s+/g, '').toUpperCase();

      setFormData((prev) => ({
        ...prev,
        initialPassword: `${safeLastName}_${year}`,
      }));
    }
  }, [formData.lastname]);

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.lastname ||
      !formData.firstname ||
      !formData.program ||
      !formData.email ||
      !formData.initialPassword
    ) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/auth/addAdviser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstname,
          lastName: formData.lastname,
          mi: formData.mi,
          program: formData.program,
          email: formData.email,
          password: formData.initialPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add adviser');
      }

      const newAdviser = await response.json();
      onAddSuccess && onAddSuccess(newAdviser);
      alert('Adviser added successfully!');

      setFormData({
        lastname: '',
        firstname: '',
        mi: '',
        program: '',
        email: '',
        initialPassword: '',
      });
    } catch (err) {
      console.error('Add adviser error:', err);
      setError(err.message || 'Failed to add adviser. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Register New Adviser</h2>
          <p className="text-red-100 text-sm mt-1">Fill in the details below to add a new adviser to the system</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">M.I.</label>
              <input
                type="text"
                name="mi"
                value={formData.mi}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* DETAILS ROW (ID REMOVED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Program <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />

              {/* Instruction */}
              <p className="mt-1 text-sm text-gray-500">
                Please enter the complete program name (e.g., <em>Bachelor of Science in Information Technology</em>).
                Do not use abbreviations (e.g., BSIT, IT).
              </p>
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
                className="w-full pr-20 px-4 py-2 border rounded-md bg-gray-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Default password format: <strong>LASTNAME_CURRENTYEAR</strong>
            </p>
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
              {submitting ? 'Adding...' : 'Add Adviser'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdviser;
