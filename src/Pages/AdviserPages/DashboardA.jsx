// src/pages/Dashboard/DashboardA.jsx
import { LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import KPICard from '../../Components/KPICard';
import PasswordChangeReminderModal from '../../Components/PasswordChangeReminderModal';
import InternA_ from './InternA_in_dashboardA';

/* =========================
   ABBREVIATE PROGRAM
========================= */
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

/* =========================
   HELPER: GET ADVISER PROGRAM
========================= */
const getAdviserProgram = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.program || payload.department || null;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};

const DashboardA = () => {
  const adviserProgram = getAdviserProgram();
  const [showPasswordReminder, setShowPasswordReminder] = useState(false);

  const [kpiData, setKpiData] = useState({
    activeInterns: 'Loading...',
    activePrograms: 'Loading...',
    partnerHTE: 'Loading...',
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');

        /* =========================
           FETCH INTERN COUNTS
        ========================= */
        const [internRes, hteRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/dashboard/programs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/dashboard/kpis`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const programData = await internRes.json();
        const kpis = await hteRes.json();
        const userData = await userRes.json();

        // Check if password needs to be changed
        const hasShownPasswordReminder = sessionStorage.getItem('passwordReminderShown');
        if (userData.forcePasswordChange && !hasShownPasswordReminder) {
          setShowPasswordReminder(true);
          sessionStorage.setItem('passwordReminderShown', 'true');
        }

        /* =========================
           FILTER BY ADVISER PROGRAM
        ========================= */
        const adviserProgramData = programData.find((p) => p.program === adviserProgram);

        const activeInterns = adviserProgramData ? adviserProgramData.count : 0;

        /* =========================
           KPI UPDATE
        ========================= */
        setKpiData({
          activeInterns,
          activePrograms: abbreviateProgram(adviserProgram) || 'N/A',
          partnerHTE: kpis.partnerHTE,
        });
      } catch (err) {
        console.error('Failed to load adviser dashboard:', err);
        setKpiData({
          activeInterns: 0,
          activePrograms: abbreviateProgram(adviserProgram) || 'N/A',
          partnerHTE: 0,
        });
      }
    };

    fetchDashboardData();
  }, [adviserProgram]);

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-600">Monitor your program's intern statistics</p>
          </div>
        </div>
      </div>
      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-8">
        <KPICard
          title="Active Intern"
          value={kpiData.activeInterns}
          description="(Same program as adviser)"
          className="bg-red-800 text-white"
          valueClassName="text-6xl"
          descriptionClassName="text-white"
        />

        <KPICard
          title="Active Program"
          value={kpiData.activePrograms}
          description="Assigned Program"
          className="bg-red-800 text-white"
          valueClassName="text-4xl"
          descriptionClassName="text-white"
        />

        <KPICard
          title="Partner HTE"
          value={kpiData.partnerHTE}
          description="Active Partnership"
          className="bg-red-800 text-white"
          valueClassName="text-6xl"
          descriptionClassName="text-white"
        />
      </div>
      {/* INTERN TABLE */}
      <InternA_ />
      {/* Password Change Reminder Modal */}
      <PasswordChangeReminderModal
        isVisible={showPasswordReminder}
        onClose={() => setShowPasswordReminder(false)}
        userRole="adviser"
      />{' '}
    </div>
  );
};

export default DashboardA;
