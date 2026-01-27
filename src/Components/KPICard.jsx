// src/components/KPICard.js
import { TrendingUp } from 'lucide-react';

const KPICard = ({ title, value, description, className = '' }) => {
  return (
    <div
      className={`bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-red-600/30 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-yellow-200 uppercase tracking-wide">{title}</div>
        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-yellow-300" />
        </div>
      </div>
      <div className="text-5xl lg:text-6xl font-extrabold leading-none mb-2 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
        {value}
      </div>
      {description && <div className="text-sm text-yellow-100/80">{description}</div>}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mb-12 -mr-12"></div>
    </div>
  );
};

export default KPICard;
