import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

const NotarizedAgreementForm = ({ onClose, onUploaded }) => {
  const [form, setForm] = useState({
    studentName: '',
    guardianName: '',
    course: '',
    hteName: '',
    hteAddress: '',
    authorizedRep: '',
    startDate: '',
    endDate: '',
    hours: '',
  });

  /* =========================
     FETCH AGREEMENT DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      console.log('🔑 Token from storage:', token ? '✅ exists' : '❌ missing');

      try {
        console.log('🔄 Fetching from /api/documents/notarized-agreement-data...');
        const res = await fetch('http://localhost:5000/api/documents/notarized-agreement-data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📊 Response status:', res.status, res.statusText);

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Agreement data loaded:', data);
          setForm((prev) => ({
            ...prev,
            studentName: data.studentName || '',
            guardianName: data.guardian || '',
            course: data.program || '',
            hteName: data.hteName || '',
            hteAddress: data.hteAddress || '',
            authorizedRep: data.authorizedRep || '',
            startDate: data.startDate || '',
            hours: data.hours || '',
          }));
          return; // Success, exit early
        }

        console.warn('⚠️ Agreement data error (status ' + res.status + ')');

        // Fallback user info if primary data unavailable
        console.log('🔄 Fallback: Fetching from /api/auth/me...');
        const me = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (me.ok) {
          const user = await me.json();
          console.log('✅ User data loaded (fallback):', user);
          setForm((prev) => ({
            ...prev,
            studentName: prev.studentName || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
            course: prev.course || user.program || '',
          }));
        }
      } catch (err) {
        console.error('❌ Fetch notarized agreement failed:', err);
      }
    };

    fetchData();
  }, []);

  /* =========================
     HOURS → END DATE LOGIC
  ========================= */
  const HOURS_PER_DAY = 8;

  const calculateEndDate = (startDate, hours) => {
    if (!startDate || !hours) return '';

    let remaining = Number(hours);
    let date = new Date(startDate);

    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) remaining -= HOURS_PER_DAY;
    }

    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Recalculate end date when hours OR start date changes
      if (name === 'hours' || name === 'startDate') {
        const startDate = name === 'startDate' ? value : prev.startDate;
        const hours = name === 'hours' ? value : prev.hours;
        updated.endDate = calculateEndDate(startDate, hours);
      }

      return updated;
    });
  };

  /* =========================
     SAVE & GENERATE PDF
  ========================= */
  const handleSave = async () => {
    if (!form.guardianName || !form.hours) {
      alert('Please fill guardian name and required hours');
      return;
    }

    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/documents/notarized-agreement-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        guardianName: form.guardianName,
        hours: form.hours,
        endDate: form.endDate,
      }),
    });

    if (!res.ok) {
      alert('Failed to generate agreement');
      return;
    }

    const data = await res.json();
    window.open(`http://localhost:5000${data.fileUrl}`, '_blank');
    if (onUploaded) {
      const filename = data.file || data.filename || data.fileUrl?.split('/').pop();
      onUploaded(filename || null);
    }
    onClose && onClose();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-5">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={28} />
          <h2 className="text-2xl font-bold text-white">Notarized Internship Agreement</h2>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-4">
        {/* Student Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
          <input
            value={form.studentName}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Guardian Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Parent / Guardian Name <span className="text-red-600">*</span>
          </label>
          <input
            name="guardianName"
            value={form.guardianName}
            onChange={handleChange}
            placeholder="Enter parent or guardian name"
            className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Course / Program</label>
          <input
            value={form.course}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company / HTE Name</label>
          <input
            value={form.hteName}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Company Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Address</label>
          <input
            value={form.hteAddress}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Authorized Representative */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Authorized Representative</label>
          <input
            value={form.authorizedRep}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {/* Required Hours */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Required Hours <span className="text-red-600">*</span>
          </label>
          <input
            name="hours"
            value={form.hours}
            onChange={handleChange}
            placeholder="Enter total required hours"
            className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-calculated based on hours, or select manually</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gray-300 hover:bg-gray-400 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-800 text-white font-medium transition-all shadow-md hover:shadow-lg"
          >
            Save & Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotarizedAgreementForm;
