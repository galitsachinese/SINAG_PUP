import { differenceInDays } from 'date-fns';
import { Building2, FileText, Pencil, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import AddNewCompany from './AddNewCompany';
import UpdateMoa from './UpdateMOA';

const HTEC = () => {
  const [HTE, setHTE] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddNewCompanyForm, setShowAddNewCompanyForm] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  /* ================= FETCH HTE ================= */
  useEffect(() => {
    const fetchHTE = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/auth/HTE', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
  }, []);

  /* ================= MOA STATUS ================= */
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

  /* ================= DELETE ================= */
  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/auth/HTE/${companyToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete HTE');
      }

      setHTE((prev) => prev.filter((c) => c.id !== companyToDelete.id));
      setCompanyToDelete(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete HTE.');
    }
  };

  /* ================= FILTER ================= */
  const filteredHTE = HTE.filter((company) => company.name?.toLowerCase().includes(searchTerm.toLowerCase()));

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
              <p className="text-sm text-gray-600 mb-0.5">Manage partner companies and MOA status</p>
              <p className="text-xs text-gray-500">{filteredHTE.length} total companies</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowAddNewCompanyForm(true)}
              className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base whitespace-nowrap transform hover:-translate-y-0.5"
            >
              + Add New HTE
            </button>

            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search company name..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
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
                {['ACTIONS', 'NO.', 'HTE', 'EMAIL', 'SUPERVISOR', 'ADDRESS', 'NATURE', 'MOA VALIDITY', 'MOA'].map(
                  (title, idx) => (
                    <th
                      key={idx}
                      className={`px-6 py-4 text-xs font-bold text-white uppercase tracking-wider ${
                        idx === 0 ? 'text-center' : ''
                      }`}
                    >
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    Loading HTE...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredHTE.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No HTE found.
                  </td>
                </tr>
              ) : (
                filteredHTE.map((company, index) => {
                  const { text, color } = computeMoaStatus(company.moaStart, company.moaEnd);

                  return (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowUpdateConfirm(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(company)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

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

      {/* ================= DELETE MODAL ================= */}
      {showDeleteConfirm && companyToDelete && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-red-900 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold text-yellow-500 mb-4">Remove HTE</h2>
            <p className="text-white mb-6">
              Are you sure you want to delete <b>{companyToDelete.name}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-yellow-500 rounded-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPDATE MOA MODAL ================= */}
      {showUpdateConfirm && selectedCompany && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <UpdateMoa
            company={selectedCompany}
            onCancel={() => setShowUpdateConfirm(false)}
            onUpdateSuccess={(updatedCompany) => {
              setHTE((prev) => prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)));
              setShowUpdateConfirm(false);
            }}
          />
        </div>
      )}

      {/* ================= ADD HTE MODAL ================= */}
      {showAddNewCompanyForm && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <AddNewCompany
            onAddSuccess={(newCompany) => {
              setHTE((prev) => [...prev, newCompany]);
              setShowAddNewCompanyForm(false);
            }}
            onCancel={() => setShowAddNewCompanyForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default HTEC;
