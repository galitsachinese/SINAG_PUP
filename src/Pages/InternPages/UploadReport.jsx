import { Award, Calendar, Camera, Clock, FileText, Send, Target, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const UploadReport = ({ onClose, onUploadSuccess, editingReport }) => {
  const fileInputRef = useRef(null);

  /* =========================
     FORM STATE
  ========================= */
  const [form, setForm] = useState({
    day: '',
    date: '',
    timeIn: '',
    timeOut: '',
    tasks: '',
    skills: '',
    learning: '',
  });

  const [totalHours, setTotalHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // ✅ Track selected file
  const [filePreview, setFilePreview] = useState(null); // ✅ Show preview

  /* =========================
     PREFILL FORM WHEN EDITING
  ========================= */
  useEffect(() => {
    if (editingReport) {
      setForm({
        day: editingReport.dayNo || '',
        date: editingReport.logDate || '',
        timeIn: editingReport.timeIn || '',
        timeOut: editingReport.timeOut || '',
        tasks: editingReport.tasksAccomplished || '',
        skills: editingReport.skillsEnhanced || '',
        learning: editingReport.learningApplied || '',
      });

      // If there's an existing photo, show it
      if (editingReport.photoUrl) {
        setFilePreview(`http://localhost:5000/${editingReport.photoUrl}`);
      }
    }
  }, [editingReport]);

  /* =========================
     AUTO CALCULATE TOTAL HOURS
  ========================= */
  useEffect(() => {
    if (!form.timeIn || !form.timeOut) {
      setTotalHours('');
      return;
    }

    const [inH, inM] = form.timeIn.split(':').map(Number);
    const [outH, outM] = form.timeOut.split(':').map(Number);

    let start = inH * 60 + inM;
    let end = outH * 60 + outM;

    // overnight support
    if (end < start) end += 24 * 60;

    setTotalHours(((end - start) / 60).toFixed(2));
  }, [form.timeIn, form.timeOut]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (image only)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.date || !form.timeIn || !form.timeOut || !form.tasks) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let token =
        localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('auth_token');

      if (!token) {
        alert('No authentication token found. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // ✅ Use FormData to send file + data
      const formData = new FormData();
      formData.append('log_date', form.date);
      formData.append('time_in', form.timeIn);
      formData.append('time_out', form.timeOut);
      formData.append('tasks_accomplished', form.tasks);
      formData.append('skills_enhanced', form.skills);
      formData.append('learning_applied', form.learning);

      // ✅ Append file if selected
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      // ✅ Determine if creating or updating
      const isEditing = editingReport && editingReport.id;
      const url = isEditing ? `/api/daily-logs/${editingReport.id}` : '/api/daily-log';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData, // ✅ Send FormData instead of JSON
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.message}`);
        console.error('Upload failed:', data);
        setIsSubmitting(false);
        return;
      }

      // Success!
      alert(isEditing ? 'Daily log updated successfully!' : 'Daily log saved successfully!');
      console.log('Saved log:', data);

      // Reset form
      setForm({
        day: '',
        date: '',
        timeIn: '',
        timeOut: '',
        tasks: '',
        skills: '',
        learning: '',
      });
      setTotalHours('');
      clearFile();
      setIsSubmitting(false);

      // Call callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      alert('Network error: ' + err.message);
      console.error('Fetch error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <FileText className="text-white" size={24} />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            {editingReport ? 'Edit Activity Report' : 'Daily Activity Report'}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
            title="Close"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white overflow-y-auto flex-1">
        {/* LEFT SIDE */}
        <div className="lg:col-span-4 bg-gradient-to-b from-red-50 to-white p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-gray-700 text-xs sm:text-sm font-medium">
                Document your daily progress and activities
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* DAY + DATE */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <Award size={14} className="text-red-800 sm:w-4 sm:h-4" /> Day #
                  </label>
                  <input
                    type="text"
                    name="day"
                    value={form.day}
                    onChange={handleChange}
                    placeholder="01"
                    className="w-full px-3 sm:px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-center font-bold text-red-800 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <Calendar size={14} className="text-red-800 sm:w-4 sm:h-4" /> Date{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* TIME IN / OUT */}
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border-2 border-red-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">
                  Time In / Out <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-600 uppercase mb-1 sm:mb-2">In</span>
                    <input
                      type="time"
                      name="timeIn"
                      value={form.timeIn}
                      onChange={handleChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-center font-bold text-red-800 bg-red-50 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-600 uppercase mb-1 sm:mb-2">Out</span>
                    <input
                      type="time"
                      name="timeOut"
                      value={form.timeOut}
                      onChange={handleChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-center font-bold text-red-800 bg-red-50 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* TOTAL HOURS */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                  <Clock size={14} className="text-red-800 sm:w-4 sm:h-4" /> Total Hours
                </label>
                <input
                  type="text"
                  value={totalHours}
                  readOnly
                  placeholder="0.00"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-bold text-center text-base sm:text-lg"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={!form.timeOut || isSubmitting}
            className="mt-6 sm:mt-8 w-full bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-800 text-white py-3 sm:py-4 rounded-lg font-bold uppercase tracking-wide shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 transition-all text-sm sm:text-base"
          >
            <Send size={16} className="sm:w-5 sm:h-5" />{' '}
            {isSubmitting
              ? editingReport
                ? 'Updating...'
                : 'Submitting...'
              : editingReport
                ? 'Update Report'
                : 'Submit Report'}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-8 p-6 md:p-8 lg:p-10 space-y-6 bg-white">
          {/* TASKS */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target size={18} className="text-red-800" />
              Tasks Accomplished <span className="text-red-600">*</span>
            </label>
            <textarea
              name="tasks"
              value={form.tasks}
              onChange={handleChange}
              placeholder="Describe the tasks you completed today..."
              className="w-full p-4 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all min-h-[140px] resize-none"
            />
          </div>

          {/* SKILLS + LEARNING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Skills Enhanced</label>
              <textarea
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="What skills did you improve?"
                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Learning Applied</label>
              <textarea
                name="learning"
                value={form.learning}
                onChange={handleChange}
                placeholder="How did you apply your knowledge?"
                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
              />
            </div>
          </div>

          {/* PHOTO UPLOAD */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1 sm:gap-2">
              <Camera size={16} className="text-red-800 sm:w-5 sm:h-5" />
              Photo Attachment <span className="text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            {filePreview ? (
              <div className="relative">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-48 sm:h-64 object-cover rounded-lg border-2 border-red-300"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                  📎 {selectedFile?.name}{' '}
                  <span className="text-gray-400">({(selectedFile?.size / 1024).toFixed(0)} KB)</span>
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 sm:p-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300 cursor-pointer hover:bg-red-100 transition-colors"
              >
                <Camera size={32} className="text-red-800 sm:w-10 sm:h-10 mb-2 sm:mb-3" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Click to upload photo</span>
                <span className="text-xs text-gray-500 mt-1">Max 5MB • Images only</span>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
