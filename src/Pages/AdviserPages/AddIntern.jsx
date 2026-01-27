import { useEffect, useState } from 'react';

const AddIntern = ({ onAddSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    mi: '',
    id: '',
    program: '',
    email: '',
    initialPassword: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     FETCH ADVISER PROGRAM
  ========================= */
  useEffect(() => {
    const fetchAdviserProgram = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const user = await res.json();

        if (user.role?.toLowerCase() !== 'adviser') {
          setError('Only advisers can add interns.');
          return;
        }

        if (!user.program) {
          setError('Your adviser account has no program assigned.');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          program: user.program,
        }));
      } catch (err) {
        console.error(err);
        setError('Failed to load adviser program.');
      }
    };

    fetchAdviserProgram();
  }, []);

  /* =========================
     AUTO-GENERATE PASSWORD
     LASTNAME_YEAR (MATCHES BACKEND)
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
     HANDLE INPUT
     - AUTO CAPS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setFormData((prev) => ({
        ...prev,
        email: value,
      }));
      return;
    }

    if (name === 'id') {
      setFormData((prev) => ({
        ...prev,
        id: value.toUpperCase(),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lastname || !formData.firstname || !formData.id || !formData.email || !formData.program) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/addIntern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstname,
          lastName: formData.lastname,
          mi: formData.mi,
          studentId: formData.id,
          program: formData.program,
          email: formData.email,
          // ❌ DO NOT SEND PASSWORD (backend generates it)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add intern');
      }

      const newIntern = await response.json();
      onAddSuccess && onAddSuccess(newIntern);

      alert('Intern added successfully!\nLogin credentials have been sent to the intern’s email.');

      setFormData((prev) => ({
        lastname: '',
        firstname: '',
        mi: '',
        id: '',
        program: prev.program,
        email: '',
        initialPassword: '',
      }));
    } catch (err) {
      console.error('Add intern error:', err);
      setError(err.message || 'Failed to add intern. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Add New Intern</h2>
          <p className="text-red-100 text-sm mt-1">Fill in the details below to add a new intern to the system</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
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
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">M.I.</label>
              <input
                type="text"
                name="mi"
                value={formData.mi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* DETAILS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* PROGRAM ROW */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program (Inherited from Adviser)</label>
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 shadow-sm text-sm">
              {formData.program}
            </div>
          </div>

          {/* PASSWORD PREVIEW (UI PRESERVED) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Password (Auto-generated)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.initialPassword}
                readOnly
                className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-0 px-4 text-sm text-red-700 hover:text-red-800 font-medium transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? 'Adding…' : 'Add Intern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIntern;
