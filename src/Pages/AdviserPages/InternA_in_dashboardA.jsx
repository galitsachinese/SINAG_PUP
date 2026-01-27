import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdviserReportModal from '../../Components/AdviserReportModal';

/* =========================
   GET ADVISER PROGRAM
========================= */
const getAdviserProgramFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.program ? payload.program.trim().toLowerCase() : null;
  } catch (err) {
    console.error('❌ Failed to decode token:', err);
    return null;
  }
};

const InternA_in_dashboardA = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportModal, setReportModal] = useState({
    isOpen: false,
    selectedIntern: null,
  });

  /* =========================
     ADVISER PROGRAM
  ========================= */
  const adviserProgram = useMemo(() => getAdviserProgramFromToken(), []);

  /* =========================
     SORTING
  ========================= */
  const [sortCriteria, setSortCriteria] = useState('lastname');
  const [sortOrder, setSortOrder] = useState('asc');

  /* =========================
     FETCH INTERNS
  ========================= */
  useEffect(() => {
    if (!adviserProgram) {
      setError('Unable to determine adviser program.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchInterns = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token missing');

        const res = await fetch('/api/adviser/interns', {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch interns (${res.status})`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }

        /* =========================
           FILTER BY PROGRAM
        ========================= */
        const filtered = data.filter((intern) => {
          const program = intern.User?.program;
          return program && adviserProgram && program.trim().toLowerCase() === adviserProgram;
        });

        /* =========================
           NORMALIZE DATA
        ========================= */
        const normalized = filtered.map((intern) => ({
          id: intern.id,
          studNo: intern.User?.studentId ?? 'N/A',
          lastname: intern.User?.lastName ?? 'N/A',
          firstname: intern.User?.firstName ?? 'N/A',
          mi: intern.User?.mi ?? '',
          email: intern.User?.email ?? 'N/A',
          company: intern.company?.name ?? 'N/A',
          companyEmail: intern.company?.email ?? 'N/A',
          supervisor: intern.company?.supervisorName ?? 'N/A',
        }));

        setInterns(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('❌ Failed to fetch interns:', err);
          setError(err.message || 'Failed to load interns.');
          setInterns([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInterns();

    return () => controller.abort();
  }, [adviserProgram]);

  /* =========================
     SORTING LOGIC
  ========================= */
  const handleSort = (field) => {
    if (sortCriteria === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCriteria(field);
      setSortOrder('asc');
    }
  };

  const processedInterns = [...interns].sort((a, b) => {
    const valueA = String(a[sortCriteria] ?? '').toLowerCase();
    const valueB = String(b[sortCriteria] ?? '').toLowerCase();

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const renderArrow = (field) => {
    if (sortCriteria !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const openReportModal = (intern) => {
    setReportModal({ isOpen: true, selectedIntern: intern });
  };

  const closeReportModal = () => {
    setReportModal({ isOpen: false, selectedIntern: null });
  };

  /* =========================
     RENDER (UI UNCHANGED)
  ========================= */
  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
        <table className="min-w-full border-collapse divide-y divide-gray-300">
          <thead className="bg-red-800 text-white">
            <tr>
              <th onClick={() => handleSort('studNo')} className="px-6 py-3 cursor-pointer text-xs font-bold uppercase">
                Stud No {renderArrow('studNo')}
              </th>
              <th
                onClick={() => handleSort('lastname')}
                className="px-6 py-3 cursor-pointer text-xs font-bold uppercase"
              >
                Lastname {renderArrow('lastname')}
              </th>
              <th
                onClick={() => handleSort('firstname')}
                className="px-6 py-3 cursor-pointer text-xs font-bold uppercase"
              >
                Firstname {renderArrow('firstname')}
              </th>
              <th className="px-6 py-3 text-xs font-bold uppercase">MI</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Company</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Supervisor</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Company Email</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Reports</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Loading interns...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : processedInterns.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No interns found for your program.
                </td>
              </tr>
            ) : (
              processedInterns.map((i, index) => (
                <tr key={`${i.studNo}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{i.studNo}</td>
                  <td className="px-6 py-4">{i.lastname}</td>
                  <td className="px-6 py-4">{i.firstname}</td>
                  <td className="px-6 py-4">{i.mi}</td>
                  <td className="px-6 py-4">{i.email}</td>
                  <td className="px-6 py-4">{i.company}</td>
                  <td className="px-6 py-4">{i.supervisor}</td>
                  <td className="px-6 py-4">{i.companyEmail}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openReportModal(i)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="View reports"
                    >
                      <CheckCircle2 className="h-6 w-6 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdviserReportModal isOpen={reportModal.isOpen} onClose={closeReportModal} intern={reportModal.selectedIntern} />
    </>
  );
};

export default InternA_in_dashboardA;
