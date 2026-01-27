import { Building2, ClipboardCheck, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Evaluation = () => {
  const navigate = useNavigate();

  const handleEvaluate = (type) => {
    if (type === 'company') {
      navigate('/pup-sinag/intern/hte-evaluation');
    } else {
      navigate('/pup-sinag/intern/supervisor-evaluation');
    }
  };

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 py-6 space-y-6">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm flex-shrink-0">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Performance Evaluation</h1>
            <p className="text-red-100 text-base sm:text-lg mt-1">Select a category to begin your assessment</p>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        <EvaluationCard title="Company" icon={<Building2 size={48} />} onClick={() => handleEvaluate('company')} />

        <EvaluationCard
          title="Supervisor"
          icon={<UserCheck size={48} />}
          onClick={() => handleEvaluate('supervisor')}
        />
      </div>
    </div>
  );
};

const EvaluationCard = ({ title, icon, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white rounded-2xl border-2 border-gray-200
               shadow-xl hover:shadow-2xl transition-all duration-300
               hover:-translate-y-1 active:scale-95 overflow-hidden
               p-8 sm:p-10 flex flex-col items-center justify-center min-h-[280px]"
  >
    {/* Accent Bar */}
    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-red-800 to-red-900 group-hover:h-3 transition-all duration-300"></div>

    {/* Icon */}
    <div
      className="flex items-center justify-center w-24 h-24 mb-6 rounded-2xl
                 bg-red-50 text-red-800
                 shadow-md
                 group-hover:bg-gradient-to-br group-hover:from-red-800 group-hover:to-red-900
                 group-hover:text-white group-hover:scale-110
                 transition-all duration-300"
    >
      {icon}
    </div>

    {/* Title */}
    <span className="text-2xl font-bold uppercase tracking-wider text-gray-800 group-hover:text-red-800 transition-colors mb-4">
      {title}
    </span>

    {/* CTA */}
    <div
      className="px-8 py-3 rounded-lg text-sm font-bold
                 bg-gray-50 text-gray-600
                 group-hover:bg-gradient-to-r group-hover:from-red-800 group-hover:to-red-900
                 group-hover:text-white
                 transition-all duration-300 shadow-md"
    >
      START EVALUATION
    </div>
  </button>
);

export default Evaluation;
