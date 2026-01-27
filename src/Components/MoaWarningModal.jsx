import { AlertTriangle, Building2, Calendar, ChevronRight, X } from 'lucide-react';

const MoaWarningModal = ({ isVisible, onClose, warnings, type = 'supervisor' }) => {
  if (!isVisible) return null;

  const isSupervisor = type === 'supervisor';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      {/* Refined Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full 
        ${isSupervisor ? 'max-w-md' : 'max-w-2xl'} 
        overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
      >
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900" />

        <div className="relative p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-yellow-50/50">
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-black tracking-tight">
              {isSupervisor ? 'Action Required' : 'MOA Expiration Summary'}
            </h3>
            <p className="text-gray-600 mt-2 text-sm max-w-[280px]">
              {isSupervisor
                ? 'Your agreement status needs immediate attention.'
                : 'The following partnerships require renewal to maintain operations.'}
            </p>
          </div>

          {/* Content Area */}
          <div className={`space-y-4 ${!isSupervisor && 'max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar'}`}>
            {isSupervisor ? (
              /* Supervisor Card */
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full animate-pulse ${warnings.status === 'Expired' ? 'bg-red-500' : 'bg-yellow-500'}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Current Status</span>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  Your MOA is{' '}
                  <span className={`font-bold ${warnings.status === 'Expired' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {warnings.status === 'Expired' ? 'Expired' : 'Expiring Soon'}
                  </span>
                  .
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    Valid until: <strong>{warnings.expiration}</strong>
                  </span>
                </div>
              </div>
            ) : (
              /* Coordinator List */
              warnings.map((warning, index) => (
                <div
                  key={index}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-yellow-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        warning.status === 'Expired' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-black group-hover:text-red-700 transition-colors">
                        {warning.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(warning.moaEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      warning.status === 'Expired' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {warning.status}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-8">
            <button
              onClick={onClose}
              className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-red-800 to-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl"
            >
              I Understand
              <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-4 italic">
              Please contact administration for further assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoaWarningModal;
