import { ClipboardCheck, FileCheck, FileText, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GenerateReports = () => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [adviserProgram, setAdviserProgram] = useState(null);

  // Fetch adviser's program on component mount
  useEffect(() => {
    const fetchAdviserProgram = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch adviser info');

        const user = await res.json();
        if (user.program) {
          setAdviserProgram(user.program);
        } else {
          setError('Your adviser account has no program assigned.');
        }
      } catch (err) {
        console.error('Error fetching adviser program:', err);
        setError('Failed to load your program information.');
      }
    };

    fetchAdviserProgram();
  }, []);

  const reportCards = [
    {
      id: 'interns-by-hte',
      title: 'INTERN IN HTE',
      icon: <UserCheck size={32} />,
      description: 'List of interns currently placed in Host Training Establishments.',
      endpoint: '/api/reports/interns-by-hte',
    },
    {
      id: 'intern-documents',
      title: 'INTERN SUBMITTED DOCS',
      icon: <FileCheck size={32} />,
      description: 'Tracking and verification of submitted internship requirements.',
      endpoint: '/api/reports/intern-documents',
    },
    {
      id: 'intern-evaluations',
      title: 'INTERN WITH AVERAGE EVAL',
      icon: <ClipboardCheck size={32} />,
      description: 'Summary of performance ratings and average evaluation scores.',
      endpoint: '/api/reports/intern-evaluations',
    },
    // {
    //   id: 'endorsement-letter',
    //   title: 'ENDORSEMENT LETTER',
    //   icon: <ClipboardCheck size={32} />,
    //   description: 'Generate a standard endorsement letter for interns in your program.',
    //   type: 'endorsement',
    // },
  ];

  // const generateEndorsementLetter = () => {
  //   try {
  //     if (!adviserProgram) {
  //       setError('Program information not loaded. Please try again.');
  //       return;
  //     }
  //
  //     const doc = new jsPDF();
  //     const pageWidth = doc.internal.pageSize.getWidth();
  //     let y = 25;
  //     const today = new Date().toLocaleDateString();
  //
  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(18);
  //     doc.text('ENDORSEMENT LETTER', pageWidth / 2, y, { align: 'center' });
  //
  //     y += 15;
  //     doc.setFontSize(11);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(`Date: ${today}`, 20, y);
  //
  //     y += 15;
  //     doc.text('To Whom It May Concern,', 20, y);
  //
  //     y += 12;
  //     const body = [
  //       `This letter serves to endorse interns under the ${adviserProgram} program for on-the-job training/practicum placement.`,
  //       'These students are recommended to engage with your organization to further develop professional competencies,',
  //       'apply academic learning in real-world settings, and fulfill institutional training requirements.',
  //       'We respectfully request your consideration in accommodating our interns and providing opportunities for practical exposure.',
  //     ];
  //
  //     const bodyLines = doc.splitTextToSize(body.join(' '), pageWidth - 40);
  //     doc.text(bodyLines, 20, y);
  //
  //     y += bodyLines.length * 6 + 18;
  //     doc.text('Thank you for your support.', 20, y);
  //
  //     y += 18;
  //     doc.setFont('helvetica', 'bold');
  //     doc.text('Adviser', 20, y);
  //
  //     doc.save(`Endorsement_${adviserProgram.replace(/\s+/g, '_')}.pdf`);
  //   } catch (err) {
  //     console.error('❌ Endorsement generation error:', err);
  //     setError('Failed to generate endorsement letter');
  //   }
  // };

  const handleGenerateReport = async (report) => {
    // Endorsement generation temporarily disabled
    // if (report.type === 'endorsement') {
    //   generateEndorsementLetter();
    //   return;
    // }

    setLoading(report.id);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(null);
        return;
      }

      if (!adviserProgram) {
        setError('Program information not loaded. Please try again.');
        setLoading(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}${report.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ program: adviserProgram }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to generate ${report.title} report`);
      }

      const blob = await res.blob();
      window.open(URL.createObjectURL(blob));
    } catch (err) {
      console.error('❌ Report generation error:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(null);
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
            <p className="text-sm text-gray-600">Download PDF reports for your program's interns</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-800 font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 hover:border-yellow-400 transform hover:-translate-y-2 group"
          >
            <div className="bg-gradient-to-br from-red-800 to-red-700 text-white p-4 rounded-lg inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{card.title}</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{card.description}</p>
            <button
              onClick={() => handleGenerateReport(card)}
              disabled={loading !== null}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading === card.id ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    color: '#800000', // PUP Maroon
    fontSize: '2.5rem',
    fontWeight: '900',
    letterSpacing: '1.5px',
    margin: '0',
  },
  underline: {
    width: '60px',
    height: '5px',
    backgroundColor: '#FFD700', // PUP Gold
    margin: '15px auto',
    borderRadius: '10px',
  },
  errorContainer: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
    backgroundColor: '#fee',
    border: '1px solid #f99',
    borderRadius: '8px',
    padding: '16px',
  },
  errorText: {
    color: '#c00',
    margin: '0',
    fontSize: '0.95rem',
  },
  horizontalWrapper: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '30px',
    padding: '20px',
  },
  card: {
    flex: '1',
    backgroundColor: '#fff',
    border: '1.5px solid #f0f0f0',
    borderRadius: '20px',
    padding: '40px 25px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  },
  iconContainer: {
    color: '#800000',
    marginBottom: '25px',
    backgroundColor: '#fff1f1',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    color: '#1a1a1a',
    fontSize: '1rem',
    fontWeight: '800',
    marginBottom: '15px',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    lineHeight: '1.3',
  },
  cardDescription: {
    color: '#666666',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '30px',
    flexGrow: 1,
  },
  button: {
    width: '100%',
    backgroundColor: '#800000',
    color: '#ffffff',
    border: 'none',
    padding: '12px 0',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
};

export default GenerateReports;
