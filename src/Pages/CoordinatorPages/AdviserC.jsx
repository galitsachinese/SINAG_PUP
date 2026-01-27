import { Pencil, Presentation, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddAdviser from './AddAdviser';
import EditAdviser from './EditAdviser';

const AdviserC = () => {
  const [advisers, setAdvisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddAdviserForm, setShowAddAdviserForm] = useState(false);

  const [showEditAdviserForm, setShowEditAdviserForm] = useState(false);
  const [adviserToEdit, setAdviserToEdit] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adviserToDelete, setAdviserToDelete] = useState(null);

  /* =========================
     FETCH ADVISERS
  ========================= */
  useEffect(() => {
    const fetchAdvisers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/auth/advisers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setAdvisers(data);
      } catch (err) {
        console.error('Failed to fetch advisers:', err);
        setError('Failed to load advisers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisers();
  }, []);

  /* =========================
     SEARCH
  ========================= */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAdvisers = advisers.filter((adviser) => {
    const first = adviser.firstName?.toLowerCase() || adviser.firstname?.toLowerCase() || '';
    const last = adviser.lastName?.toLowerCase() || adviser.lastname?.toLowerCase() || '';
    return first.includes(searchTerm.toLowerCase()) || last.includes(searchTerm.toLowerCase());
  });

  /* =========================
     EDIT
  ========================= */
  const handleEditClick = (adviser) => {
    setAdviserToEdit(adviser);
    setShowEditAdviserForm(true);
  };

  /* =========================
     DELETE
  ========================= */
  const handleDeleteClick = (adviser) => {
    setAdviserToDelete(adviser);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!adviserToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/auth/advisers/${adviserToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete adviser');
      }

      setAdvisers((prev) => prev.filter((a) => a.id !== adviserToDelete.id));
      setShowDeleteConfirm(false);
      setAdviserToDelete(null);
    } catch (err) {
      console.error('Delete adviser error:', err);
      alert(err.message || 'Failed to delete adviser.');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Enhanced Header Card */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5 lg:p-6 mb-6 border border-gray-200 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-800 to-red-700 p-3 rounded-lg shadow-md">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Program Advisers</h1>
              <p className="text-sm text-gray-600 mb-0.5">Manage and monitor program advisers</p>
              <p className="text-xs text-gray-500">{filteredAdvisers.length} total advisers</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setShowAddAdviserForm(true)}
              className="bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base whitespace-nowrap transform hover:-translate-y-0.5"
            >
              + Add New Adviser
            </button>

            <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                placeholder="Search adviser name..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
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
                {['ACTIONS', 'Lastname', 'Firstname', 'MI.', 'Email', 'Program', 'Interns'].map((title, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 text-xs font-bold text-white uppercase tracking-wider ${
                      idx === 0 ? 'text-center' : ''
                    }`}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading advisers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredAdvisers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No advisers found.
                  </td>
                </tr>
              ) : (
                filteredAdvisers.map((adviser) => (
                  <tr key={adviser.id}>
                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(adviser)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label="Edit adviser"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteClick(adviser)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Delete adviser"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">{adviser.lastName}</td>
                    <td className="px-6 py-4 text-sm">{adviser.firstName}</td>
                    <td className="px-6 py-4 text-sm">{adviser.mi}</td>
                    <td className="px-6 py-4 text-sm">{adviser.email}</td>
                    <td className="px-6 py-4 text-sm">{adviser.program}</td>
                    <td className="px-6 py-4 text-sm">{adviser.interns}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && adviserToDelete && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-red-900 rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold text-yellow-500 mb-4">Remove Adviser</h2>
            <p className="text-white mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {adviserToDelete.firstName} {adviserToDelete.lastName}
              </span>
              ?
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

      {/* ADD ADVISER MODAL */}
      {showAddAdviserForm && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <AddAdviser
            onAddSuccess={(newAdviser) => {
              setAdvisers((prev) => [...prev, newAdviser]);
              setShowAddAdviserForm(false);
            }}
            onCancel={() => setShowAddAdviserForm(false)}
          />
        </div>
      )}

      {/* EDIT ADVISER MODAL */}
      {showEditAdviserForm && adviserToEdit && (
        <div className="fixed inset-0 bg-red-400/20 backdrop-blur-md flex items-center justify-center z-50">
          <EditAdviser
            adviser={adviserToEdit}
            onUpdate={(updatedAdviser) => {
              setAdvisers((prev) => prev.map((a) => (a.id === updatedAdviser.id ? updatedAdviser : a)));
              setShowEditAdviserForm(false);
              setAdviserToEdit(null);
            }}
            onCancel={() => {
              setShowEditAdviserForm(false);
              setAdviserToEdit(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdviserC;
