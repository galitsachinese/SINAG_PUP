import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import KPICard from '../../Components/KPICard';
import MoaWarningModal from '../../Components/MoaWarningModal';
ChartJS.register(ArcElement, Tooltip, Legend);

/* =========================
   3D SHADOW PLUGIN
========================= */
const shadowPlugin = {
  id: 'shadowPlugin',
  beforeDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
  },
  afterDraw(chart) {
    chart.ctx.restore();
  },
};

/* =========================
   GRADIENT HELPER
========================= */
const gradient = (ctx, top, bottom) => {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  return g;
};
const abbreviateProgram = (program) => {
  if (!program || program === 'All') return program;

  const ignoreWords = ['OF', 'IN', 'THE', 'AND', 'FOR'];

  return program
    .toUpperCase()
    .replace(/-/g, ' ')
    .split(' ')
    .filter((word) => !ignoreWords.includes(word))
    .map((word) => word[0])
    .join('');
};
const DashboardC = () => {
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [programsFilter, setProgramsFilter] = useState(['All']);
  const [showMoaWarning, setShowMoaWarning] = useState(false);
  const [moaWarnings, setMoaWarnings] = useState([]);

  const [kpiData, setKpiData] = useState({
    activeInterns: 'Loading...',
    activePrograms: 'Loading...',
    partnerHTE: 'Loading...',
  });

  const [programChartData, setProgramChartData] = useState(null);
  const [companyChartData, setCompanyChartData] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [programRes, companyRes, kpiRes, adviserProgramRes] = await Promise.all([
          fetch(`${API_BASE}/api/dashboard/programs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/dashboard/companies?program=${selectedProgram}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/dashboard/kpis`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/dashboard/adviser-programs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const programData = await programRes.json();
        const companyData = await companyRes.json();
        const kpis = await kpiRes.json();
        const adviserPrograms = await adviserProgramRes.json();

        // Check for MOA warnings (separate try-catch so it doesn't break dashboard)
        try {
          const htesRes = await fetch(`${API_BASE}/api/auth/HTE`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (htesRes.ok) {
            const htesData = await htesRes.json();

            if (Array.isArray(htesData)) {
              const calculateMoaStatus = (moaEnd) => {
                if (!moaEnd) return 'N/A';
                const today = new Date();
                const endDate = new Date(moaEnd);
                const daysLeft = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
                if (daysLeft < 0) return 'Expired';
                if (daysLeft <= 30) return 'Warning';
                return 'Active';
              };

              const warnings = htesData
                .filter((hte) => {
                  const status = calculateMoaStatus(hte.moaEnd);
                  return status === 'Warning' || status === 'Expired';
                })
                .map((hte) => ({
                  name: hte.name,
                  moaEnd: hte.moaEnd,
                  status: calculateMoaStatus(hte.moaEnd),
                }));

              // Only show warning once per login session
              const hasShownWarning = sessionStorage.getItem('moaWarningShown');

              if (warnings.length > 0 && !hasShownWarning) {
                setMoaWarnings(warnings);
                setShowMoaWarning(true);
                sessionStorage.setItem('moaWarningShown', 'true');
              }
            }
          }
        } catch (moaError) {
          console.log('⚠️ MOA warning check failed (non-critical):', moaError);
        }

        /* =========================
   FILTERED PROGRAMS
========================= */
        const filteredPrograms =
          selectedProgram === 'All' ? programData : programData.filter((p) => p.program === selectedProgram);

        const filteredInternTotal = filteredPrograms.reduce((sum, p) => sum + p.count, 0);

        /* =========================
   PROGRAM FILTER LIST
========================= */
        const uniquePrograms = [...new Set(programData.map((p) => p.program))];

        setProgramsFilter(['All', ...uniquePrograms]);

        const totalProgramsCount = programData.length;

        const programPercentages = filteredPrograms.map((p) =>
          filteredInternTotal ? Math.round((p.count / filteredInternTotal) * 100) : 0,
        );

        const totalCompanyCount = companyData.reduce((sum, c) => sum + c.count, 0);

        const companyPercentages = companyData.map((c) =>
          totalCompanyCount ? Math.round((c.count / totalCompanyCount) * 100) : 0,
        );

        /* =========================
           KPI UPDATE (FILTER AWARE)
        ========================= */
        setKpiData({
          activeInterns: selectedProgram === 'All' ? kpis.activeInterns : filteredInternTotal,

          activePrograms: selectedProgram === 'All' ? totalProgramsCount : abbreviateProgram(selectedProgram),

          partnerHTE: kpis.partnerHTE,
        });

        /* =========================
           PROGRAM CHART
        ========================= */
        setProgramChartData({
          labels: filteredPrograms.map((p) => p.program),

          datasets: [
            {
              data: filteredPrograms.map((p) => p.count),
              backgroundColor: (ctx) => {
                const c = ctx.chart.ctx;
                return [
                  gradient(c, '#7A0000', '#3D0000'),
                  gradient(c, '#F5C542', '#B38E00'),
                  gradient(c, '#FFB703', '#E09F00'),
                  gradient(c, '#FFC857', '#E6A400'),
                  gradient(c, '#A80000', '#5C0000'),
                ];
              },
              borderWidth: 0,
              hoverOffset: 18,
            },
          ],
          percentages: programPercentages,
        });

        /* =========================
           COMPANY CHART
        ========================= */
        setCompanyChartData({
          labels: companyData.map((c) => c.company),
          datasets: [
            {
              data: companyData.map((c) => c.count),
              backgroundColor: (ctx) => {
                const cxt = ctx.chart.ctx;
                return [
                  gradient(cxt, '#7A0000', '#3D0000'),
                  gradient(cxt, '#F5C542', '#B38E00'),
                  gradient(cxt, '#FFB703', '#E09F00'),
                  gradient(cxt, '#FFC857', '#E6A400'),
                  gradient(cxt, '#A80000', '#5C0000'),
                ];
              },
              borderWidth: 0,
              hoverOffset: 18,
            },
          ],
          percentages: companyPercentages,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    loadData();
  }, [selectedProgram]);

  /* =========================
     CHART OPTIONS
  ========================= */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '52%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const count = data.datasets[0].data[i];
              const percentage = data.percentages?.[i] || 0;
              const internText = count === 1 ? 'intern' : 'interns';
              return {
                text: `${label}: ${count} ${internText} (${percentage}%)`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed;
            const percentage = ctx.chart.data.percentages?.[ctx.dataIndex] || 0;
            const internText = count === 1 ? 'intern' : 'interns';
            return `${ctx.label}: ${count} ${internText} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* MOA Warning Modal */}
      <MoaWarningModal
        isVisible={showMoaWarning && moaWarnings.length > 0}
        onClose={() => setShowMoaWarning(false)}
        warnings={moaWarnings}
        type="coordinator"
      />

      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-600">Monitor intern statistics and program distribution</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* FILTER SIDEBAR */}
        <aside className="bg-white rounded-xl shadow-lg p-5 w-full lg:w-64 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-red-800 to-red-700 text-white font-bold text-center py-3 mb-4 rounded-lg shadow-md">
            <span className="text-sm lg:text-base uppercase tracking-wide">📊 Filters</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            {programsFilter.map((program) => (
              <button
                key={program}
                onClick={() => setSelectedProgram(program)}
                className={`py-3 px-4 cursor-pointer rounded-lg text-sm lg:text-base transition-all duration-200 font-medium text-left ${
                  selectedProgram === program
                    ? 'bg-gradient-to-r from-red-800 to-red-700 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-800 border border-transparent hover:border-red-200'
                }`}
              >
                {abbreviateProgram(program)}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN DASHBOARD */}
        <main className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <KPICard title="Active Intern" value={kpiData.activeInterns} />
            <KPICard title="Active Programs" value={kpiData.activePrograms} />
            <KPICard title="Partner HTE" value={kpiData.partnerHTE} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-5 lg:p-7 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-3 h-3 bg-red-800 rounded-full animate-pulse"></div>
                <h3 className="text-center font-bold text-base lg:text-lg text-gray-800">Interns Per Program</h3>
              </div>
              <div className="h-64 lg:h-80">
                {programChartData && <Pie data={programChartData} options={chartOptions} plugins={[shadowPlugin]} />}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-5 lg:p-7 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <h3 className="text-center font-bold text-base lg:text-lg text-gray-800">Interns Per Company</h3>
              </div>
              <div className="h-64 lg:h-80">
                {companyChartData && <Pie data={companyChartData} options={chartOptions} plugins={[shadowPlugin]} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardC;
