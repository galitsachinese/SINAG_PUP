import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

const ConsentForm = ({ onClose, onUploaded }) => {
  const [form, setForm] = useState({
    studentName: '',
    guardianName: '',
    hours: '',
    startDate: '',
    endDate: '',
    hteName: '',
    hteAddress: '',
    supervisorName: '',
    course: '',
  });

  /* =========================
     FETCH CONSENT DATA
  ========================= */
  useEffect(() => {
    const fetchConsentData = async () => {
      const token = localStorage.getItem('token');
      console.log('🔑 Token from storage:', token ? '✅ exists' : '❌ missing');

      try {
        // Try to get full consent data (requires HTE assignment)
        console.log('🔄 Fetching from /api/auth/consent-data...');
        const res = await fetch('http://localhost:5000/api/auth/consent-data', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('📊 Response status:', res.status, res.statusText);

        if (res.ok) {
          const data = await res.json();
          console.log('✅ Consent data loaded:', data);
          setForm((prev) => ({
            ...prev,
            studentName: data.studentName || '',
            guardianName: data.guardian || '',
            course: data.program || '',
            hteName: data.hteName || '',
            hteAddress: data.hteAddress || '',
            supervisorName: data.supervisorName || '',
            startDate: data.startDate || '',
            hours: data.hours || '',
          }));
          return; // Success, exit early
        } else {
          const err = await res.json();
          console.warn('⚠️ Consent data error (status ' + res.status + '):', err.message);
        }

        // Fallback: get basic user data and intern/company info separately
        console.log('🔄 Fallback: Fetching from /api/auth/me...');
        const me = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (me.ok) {
          const user = await me.json();
          console.log('✅ User data loaded:', user);

          setForm((prev) => ({
            ...prev,
            studentName: `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim(),
            guardianName: user.guardian || '',
            course: user.program || '',
          }));
        }

        // Also try to fetch complete intern/company data
        console.log('🔄 Fetching intern data with company details...');
        const internRes = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (internRes.ok) {
          const userData = await internRes.json();

          // Now fetch intern record with company
          const internDataRes = await fetch(`http://localhost:5000/api/intern/${userData.user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          // Try dashboard endpoint as it has some company data
          const dashRes = await fetch('http://localhost:5000/api/dashboard/intern', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (dashRes.ok) {
            const dashData = await dashRes.json();
            console.log('✅ Dashboard data loaded:', dashData);

            if (dashData.companyDetails) {
              // Get full company data from notarized endpoint (it has address)
              const notarizedRes = await fetch('http://localhost:5000/api/documents/notarized-agreement-data', {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (notarizedRes.ok) {
                const notarizedData = await notarizedRes.json();
                console.log('✅ Notarized data with company address:', notarizedData);

                setForm((prev) => ({
                  ...prev,
                  hteName: notarizedData.hteName || dashData.companyDetails.companyName || '',
                  hteAddress: notarizedData.hteAddress || '',
                  supervisorName: notarizedData.authorizedRep || dashData.companyDetails.supervisor || '',
                  startDate: notarizedData.startDate || dashData.companyDetails.startDate || prev.startDate,
                  hours: notarizedData.hours || prev.hours,
                }));
              } else {
                // Fallback to just dashboard data
                setForm((prev) => ({
                  ...prev,
                  hteName: dashData.companyDetails.companyName || '',
                  supervisorName: dashData.companyDetails.supervisor || '',
                  startDate: dashData.companyDetails.startDate || prev.startDate,
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch consent data:', err);
      }
    };

    fetchConsentData();
  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const HOURS_PER_DAY = 8;

  const calculateEndDate = (startDate, hours) => {
    if (!startDate || !hours) return '';

    let remainingHours = Number(hours);
    let date = new Date(startDate);

    while (remainingHours > 0) {
      date.setDate(date.getDate() + 1);

      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        remainingHours -= HOURS_PER_DAY;
      }
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

  const handleSave = async () => {
    if (!form.guardianName || !form.hours) {
      alert('Please fill guardian name and required hours');
      return;
    }

    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/auth/consent-save', {
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
      alert('Failed to save consent form');
      return;
    }

    const data = await res.json();

    window.open(`http://localhost:5000${data.fileUrl}`, '_blank');
    // Update parent list if provided
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
          <h2 className="text-2xl font-bold text-white">Consent Form Details</h2>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-4">
        {/* Student Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
          <input
            name="studentName"
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
            placeholder="Company Name"
          />
        </div>

        {/* Company Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Address</label>
          <input
            value={form.hteAddress}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            placeholder="Company Address"
          />
        </div>

        {/* Supervisor Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor / HR Name</label>
          <input
            value={form.supervisorName}
            readOnly
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            placeholder="Supervisor Name"
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
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gray-300 hover:bg-gray-400 font-medium transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
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

export default ConsentForm;
