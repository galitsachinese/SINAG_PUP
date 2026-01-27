import axios from 'axios';
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  FileCheck,
  FileText,
  GraduationCap,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const GenerateReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);

  useEffect(() => {
    if (!selectedReport) return;

    setLoadingPrograms(true);

    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    axios
      .get(`${API_BASE}/api/dashboard/adviser-programs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPrograms(res.data);
      })
      .catch((err) => {
        console.error('Failed to load programs', err);
      })
      .finally(() => {
        setLoadingPrograms(false);
      });
  }, [selectedReport]);

  const reportCards = [
    {
      title: 'LIST OF INTERNS',
      icon: <Users size={24} />,
      description: 'Master list of all registered interns.',
      requiresProgram: true,
    },
    {
      title: 'LIST OF ACTIVE HTE',
      icon: <Building2 size={24} />,
      description: 'Partner companies and establishments.',
      requiresProgram: false,
    },

    {
      title: 'INTERNS ASSIGNED TO HTE',
      icon: <UserCheck size={24} />,
      description: 'Company placement and status.',
      requiresProgram: true,
    },
    {
      title: 'INTERNS SUBMITTED DOCUMENTS',
      icon: <FileCheck size={24} />,
      description: 'Tracking of required paperwork.',
      requiresProgram: true,
    },
    {
      title: 'LIST OF ADVISER',
      icon: <GraduationCap size={24} />,
      description: 'Faculty advisers assigned to programs.',
      requiresProgram: false,
    },
    {
      title: 'INTERNS EVALUATION',
      icon: <ClipboardCheck size={24} />,
      description: 'Performance reviews and final grades.',
      requiresProgram: true,
    },
  ];

  const handleCardClick = (card) => {
    if (card.requiresProgram) {
      setSelectedReport(card.title);
    } else {
      generateGeneralReport(card.title);
    }
  };

  const handleProgramSelect = async (program) => {
    setGeneratingReport(selectedReport);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let endpoint = '';

      switch (selectedReport) {
        case 'LIST OF INTERNS':
          endpoint = '/api/reports/students';
          break;
        case 'LIST OF ACTIVE HTE':
          endpoint = '/api/reports/hte-list';
          break;

        case 'INTERNS ASSIGNED TO HTE':
          endpoint = '/api/reports/interns-by-hte';
          break;

        case 'INTERNS SUBMITTED DOCUMENTS':
          endpoint = '/api/reports/intern-documents';
          break;

        case 'INTERNS EVALUATION':
          endpoint = '/api/reports/intern-evaluations';
          break;

        default:
          throw new Error('Unknown report type');
      }

      const response = await axios.post(
        `${API_BASE}${endpoint}`,
        { program },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
      setSelectedReport(null);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateGeneralReport = async (reportTitle) => {
    setGeneratingReport(reportTitle);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let endpoint = '';

      switch (reportTitle) {
        case 'LIST OF ACTIVE HTE':
          endpoint = '/api/reports/hte-list';
          break;

        case 'LIST OF ADVISER':
          endpoint = '/api/reports/advisers';
          break;

        default:
          throw new Error('Unknown general report');
      }

      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      window.open(URL.createObjectURL(blob));
    } catch (err) {
      console.error('General report failed:', err);
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Generate Reports</h1>
            <p className="text-sm text-gray-600">Create and download various internship reports</p>
          </div>
        </div>
      </div>

      {/* Enhanced Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card)}
            className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-yellow-400 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
          >
            {/* Icon Container */}
            <div className="bg-gradient-to-br from-red-800 to-red-700 text-white w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </div>

            {/* Card Content */}
            <h3 className="text-base font-bold text-gray-800 mb-3 uppercase tracking-wide min-h-[48px] flex items-center">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{card.description}</p>

            {/* Button */}
            <button
              className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-300 ${
                generatingReport === card.title
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg'
              }`}
              disabled={generatingReport !== null}
            >
              {generatingReport === card.title ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </span>
              ) : card.requiresProgram ? (
                'Select Program'
              ) : (
                'Generate PDF'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Enhanced Program Selection Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-6 py-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Select Program</h2>
                <p className="text-sm text-yellow-200 mt-1">{selectedReport}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white hover:text-yellow-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Program List */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingPrograms && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading programs...</span>
                </div>
              )}

              {!loadingPrograms && programs.length === 0 && (
                <p className="text-center text-gray-500 py-12">No programs available.</p>
              )}

              {!loadingPrograms &&
                programs.map((program) => (
                  <button
                    key={program}
                    onClick={() => handleProgramSelect(program)}
                    className="w-full flex items-center justify-between px-5 py-4 mb-3 bg-gray-50 hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl transition-all duration-200 text-left group"
                  >
                    <span className="font-semibold text-gray-800 group-hover:text-red-800 transition-colors">
                      {program}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateReports;
