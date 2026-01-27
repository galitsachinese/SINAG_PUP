import { GraduationCap, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const InternC = () => {
  const [interns, setInterns] = useState([]);
  const [advisers, setAdvisers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Program Filter
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('lastname');
  const [sortOrder, setSortOrder] = useState('asc');

  /* =========================
     FETCH ADVISERS
     (1 ADVISER → 1 PROGRAM)
  ========================= */
  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/advisers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch advisers');

        const data = await res.json();
        setAdvisers(data);
      } catch (err) {
        console.error('Failed to load advisers:', err);
      }
    };

    fetchAdvisers();
  }, []);

  /* =========================
     FETCH INTERNS
     (1 PROGRAM → MANY INTERNS)
  ========================= */
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/interns', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('📦 Raw intern data:', data[0]); // Debug: Check what we're getting
        console.log('📦 Company object:', data[0]?.company); // Debug: Check company data

        const normalized = data.map((intern) => {
          const internProgram = intern.User?.program || intern.program;

          const matchedAdviser = advisers.find((adv) => adv.program === internProgram);

          return {
            studNo: intern.User?.studentId || 'N/A',
            lastname: intern.User?.lastName || 'N/A',
            firstname: intern.User?.firstName || 'N/A',
            mi: intern.User?.mi || '',
            email: intern.User?.email || 'N/A',
            program: internProgram || 'N/A',
            adviser: matchedAdviser ? `${matchedAdviser.firstName} ${matchedAdviser.lastName}` : 'N/A',
            company: intern.company?.name || 'NA',
            supervisor: intern.company?.supervisorName || 'NA',
            status: intern.status || 'NA',
          };
        });

        setInterns(normalized);
      } catch (err) {
        console.error(err);
        setError('Unable to load intern records.');
      } finally {
        setLoading(false);
      }
    };

    if (advisers.length > 0) {
      fetchInterns();
    }
  }, [advisers]);

  /* =========================
     SEARCH & PROGRAM FILTER
  ========================= */
  const filteredInterns = interns.filter((intern) => {
    // Program filter
    if (selectedProgram !== 'All' && intern.program !== selectedProgram) {
      return false;
    }

    // Search filter
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();

    return (
      intern.lastname.toLowerCase().includes(term) ||
      intern.firstname.toLowerCase().includes(term) ||
      intern.studNo.toLowerCase().includes(term) ||
      intern.email.toLowerCase().includes(term)
    );
  });

  // Get unique programs for dropdown
  const uniquePrograms = ['All', ...new Set(interns.map((i) => i.program).filter((p) => p !== 'N/A'))];

  /* =========================
     SORTING
  ========================= */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortArrow = ({ active }) => {
    if (!active) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const sortedInterns = [...filteredInterns].sort((a, b) => {
    const aVal = a[sortField]?.toString().toLowerCase() || '';
    const bVal = b[sortField]?.toString().toLowerCase() || '';

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  /* =========================
     UI (UNCHANGED)
  ========================= */
  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Program Interns</h1>
              <p className="text-sm text-gray-600 mb-0.5">Monitor and track intern records</p>
              <p className="text-xs text-gray-500">{sortedInterns.length} total interns</p>
            </div>
          </div>

          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search intern name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-800 to-red-700 text-white text-xs uppercase">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('studNo')}
                >
                  Stud ID <SortArrow active={sortField === 'studNo'} />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('lastname')}
                >
                  Lastname <SortArrow active={sortField === 'lastname'} />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('firstname')}
                >
                  Firstname <SortArrow active={sortField === 'firstname'} />
                </th>
                <th className="px-6 py-4">MI</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 relative">
                  <div className="flex items-center justify-center gap-2">
                    <span>Program</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                        className="bg-transparent text-yellow-300 border-none text-xs font-bold uppercase cursor-pointer underline decoration-yellow-300 hover:text-yellow-400 focus:outline-none"
                      >
                        {selectedProgram.length > 20 ? selectedProgram.substring(0, 20) + '...' : selectedProgram}
                        <span className="ml-1">▼</span>
                      </button>

                      {isDropdownOpen && (
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-red-800 border border-yellow-300 rounded shadow-lg z-50 max-w-[600px] max-h-[300px] overflow-y-auto overflow-x-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {uniquePrograms.map((program) => (
                            <div
                              key={program}
                              onClick={() => {
                                setSelectedProgram(program);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-4 py-2 text-xs cursor-pointer transition-colors whitespace-nowrap ${
                                program === selectedProgram
                                  ? 'bg-yellow-300 text-red-900 font-bold'
                                  : 'text-white hover:bg-yellow-300 hover:text-red-900'
                              }`}
                            >
                              {program}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3">Adviser</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Supervisor</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {loading && (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    Loading interns...
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && sortedInterns.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500">
                    No interns found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                sortedInterns.map((i, index) => (
                  <tr key={`${i.studNo}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{i.studNo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{i.lastname}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.firstname}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.mi}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{i.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.program}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.adviser}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.company}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{i.supervisor}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-bold italic ${
                          i.status === 'Approved'
                            ? 'text-green-600'
                            : i.status === 'Pending'
                              ? 'text-yellow-600'
                              : i.status === 'Declined'
                                ? 'text-red-600'
                                : 'text-gray-600'
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InternC;
