import { differenceInDays } from 'date-fns';
import { Building2, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const HTEA = () => {
  const [HTE, setHTE] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  /* =========================
     FETCH HTE DATA
  ========================= */
  useEffect(() => {
    const fetchHTE = async () => {
      setLoading(true);
      setError(null);

      try {
        let apiUrl = 'http://localhost:5000/api/auth/HTE';
        if (searchTerm) {
          apiUrl += `?q=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHTE(data);
      } catch (err) {
        console.error('Failed to fetch HTE:', err);
        setError('Failed to load HTE. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHTE();
  }, [searchTerm]);

  /* =========================
     MOA STATUS COMPUTATION
  ========================= */
  const computeMoaStatus = (start, end) => {
    if (!start || !end) {
      return {
        text: 'N/A',
        color: 'text-gray-400',
      };
    }

    const today = new Date();
    const endDate = new Date(end);
    const daysLeft = differenceInDays(endDate, today);

    // 🔴 EXPIRED
    if (daysLeft < 0) {
      return {
        text: 'MOA EXPIRED',
        color: 'text-red-600',
      };
    }

    // 🟡 10 DAYS OR LESS
    if (daysLeft <= 10) {
      return {
        text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        color: 'text-yellow-600',
      };
    }

    // 🔵 MORE THAN 10 DAYS
    return {
      text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
      color: 'text-blue-600',
    };
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Partner Companies</h1>
              <p className="text-sm text-gray-600 mb-0.5">List of HTE with MOA</p>
              <p className="text-xs text-gray-500">{HTE.length} total companies</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-red-800 to-red-700">
              <tr>
                {['NO.', 'HTE', 'EMAIL', 'SUPERVISOR', 'ADDRESS', 'NATURE', 'MOA VALIDITY', 'MOA'].map((title, idx) => (
                  <th key={idx} className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    Loading HTE...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : HTE.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No HTE found.
                  </td>
                </tr>
              ) : (
                HTE.map((company, index) => {
                  const { text, color } = computeMoaStatus(company.moaStart, company.moaEnd);

                  return (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{company.supervisorName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.address}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{company.natureOfBusiness}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
                        >
                          {text}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {company.moaFile ? (
                          <a
                            href={`http://localhost:5000/uploads/${company.moaFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View MOA"
                            className="inline-flex items-center justify-center"
                          >
                            <FileText size={20} className={color} />
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HTEA;
