import axios from '@/services/axios';

import { ArrowLeft, Building2, ClipboardCheck, Send, Star, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/* ============================
   INDICATORS DATA
============================ */

const CHARACTER_INDICATORS = [
  { text: 'The intern can be trusted with important and confidential information.', max: 10 },
  { text: 'The intern shows courtesy and transparency in his/her dealings with superiors and colleagues.', max: 10 },
  { text: 'The intern displays responsibility and accountability in doing the assigned tasks.', max: 10 },
  { text: 'The intern manifests resiliency during critical and difficult circumstances.', max: 10 },
  { text: 'The intern shows commitment and hard work in the workplace.', max: 10 },
];

const COMPETENCE_INDICATORS = [
  { text: 'The intern displays thoroughness, accuracy, and completeness in work output.', max: 5 },
  { text: 'The intern practices timeliness in the completion of assigned tasks.', max: 5 },
  {
    text: 'The intern manifests sound decision-making and logical thinking in dealing with simple problems related to his/her tasks.',
    max: 10,
  },
  {
    text: 'The intern exhibits initiative and perseverance in the performance of duties and responsibilities.',
    max: 10,
  },
  {
    text: 'The intern meets the technical skills required of the student intern by the HTE.',
    max: 15,
    hasDetails: true,
  },
  { text: 'The intern shows great potential for employment in the company.', max: 5 },
];

const EvaluationS = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();

  // Unified State
  const [ratings, setRatings] = useState(Array(CHARACTER_INDICATORS.length + COMPETENCE_INDICATORS.length).fill(''));
  const [formData, setFormData] = useState({
    internName: '',
    section: '',
    hteName: '',
    jobDescription: '',
    technicalDetails: '',
    recommendations: '',
    evaluator: '',
    designation: '',
    date: '',
    conforme: '',
  });
  const [internId, setInternId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    const fetchIntern = async () => {
      try {
        const token = localStorage.getItem('token');

        // 1️⃣ Get interns of company
        const internRes = await fetch('http://localhost:5000/api/auth/company/interns', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const interns = await internRes.json();
        const intern = interns.find((i) => String(i.studentId) === String(studentId));

        if (!intern) {
          console.error('Intern not found');
          return;
        }
        setInternId(intern.id);

        // 2️⃣ Get company profile (for HTE + supervisor)
        const companyRes = await fetch('http://localhost:5000/api/auth/company/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const company = await companyRes.json();

        // 3️⃣ Populate form
        setFormData((prev) => ({
          ...prev,
          internName: `${intern.firstName} ${intern.lastName}`,
          section: intern.program, // ✅ PROGRAM
          hteName: company.name, // ✅ COMPANY NAME
          evaluator: company.supervisorName, // ✅ SUPERVISOR NAME
          designation: 'SUPERVISOR', // ✅ FIXED
        }));
      } catch (err) {
        console.error('Failed to load evaluation data', err);
      }
    };

    fetchIntern();
  }, [studentId]);

  // Auto-calculate Total
  const totalScore = useMemo(() => {
    return ratings.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [ratings]);

  const handleRatingChange = (index, value, max) => {
    const numValue = parseFloat(value);
    if (numValue > max) return;

    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!internId) {
      alert('Intern data not loaded yet.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('/intern-evaluations', {
        intern_id: internId, // 👈 REQUIRED
        ...formData,
        ratings: ratings.map((r) => Number(r) || 0),
        totalScore: Number(totalScore),
      });

      alert('Evaluation Submitted Successfully!');
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert('Failed to submit evaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RenderRow = ({ item, index, offset = 0 }) => {
    const globalIndex = index + offset;
    return (
      <tr className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
        <td className="px-6 py-4 text-sm text-black">
          <div className="flex gap-3">
            <span className="font-bold text-zinc-400">{globalIndex + 1}.</span>
            <div>
              <span className="font-medium">{item.text}</span>
              {item.hasDetails && (
                <textarea
                  name="technicalDetails"
                  value={formData.technicalDetails}
                  onChange={handleInputChange}
                  placeholder="Specify technical skills here..."
                  className="mt-2 w-full p-2 text-xs border border-zinc-300 rounded-md bg-white focus:ring-1 focus:ring-red-800 outline-none text-black"
                  rows="2"
                />
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center font-bold text-black bg-zinc-50/50">{item.max}%</td>
        <td className="px-6 py-4">
          <input
            type="number"
            min="0"
            max={item.max}
            step="0.5"
            value={ratings[globalIndex]}
            onChange={(e) => handleRatingChange(globalIndex, e.target.value, item.max)}
            className="w-20 mx-auto block border-2 border-zinc-300 p-2 rounded-lg text-center text-black font-bold focus:border-red-800 focus:ring-2 focus:ring-red-100 transition-all outline-none"
            placeholder="0"
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 pb-12">
      {/* Top Header/Progress */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center hover:text-yellow-400 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-bold">Back</span>
          </button>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-red-200">Total Score</span>
            <p className="text-xl font-black text-yellow-400">{totalScore.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Main Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 p-8 text-center">
            <h1 className="text-3xl font-black text-white italic tracking-tight">EVALUATION INSTRUMENT</h1>
            <p className="text-red-100 mt-2 font-bold tracking-wide">Polytechnic University of the Philippines</p>
            <div className="mt-4 inline-block bg-yellow-400 text-red-900 px-4 py-1 rounded-full text-xs font-black uppercase">
              Student-Internship Program
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 border-b-2 border-zinc-100 pb-2">
                <User className="text-red-800 w-5 h-5" />
                <input value={formData.internName} disabled className="bg-zinc-50" />
              </div>
              <div className="flex items-center space-x-3 border-b-2 border-zinc-100 pb-2">
                <ClipboardCheck className="text-red-800 w-5 h-5" />
                <textarea
                  value={formData.section}
                  disabled
                  rows={1}
                  className="w-full bg-zinc-50 resize-none border-none outline-none font-bold text-black leading-tight"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 border-b-2 border-zinc-100 pb-2">
                <Building2 className="text-red-800 w-5 h-5" />
                <input value={formData.hteName} disabled className="bg-zinc-50" />
              </div>
              <div className="flex items-center space-x-3 border-b-2 border-zinc-100 pb-2">
                <Star className="text-red-800 w-5 h-5" />
                <input
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Enter intern's job description"
                  className="border-b-2 border-zinc-200 py-2 focus:border-red-800 outline-none font-bold text-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Table */}
        <div className="bg-white rounded-2xl shadow-md border border-zinc-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white text-xs uppercase tracking-wider">
                <th className="px-6 py-5 text-left font-black">Evaluation Criteria</th>
                <th className="px-6 py-5 text-center font-black w-32">Max %</th>
                <th className="px-6 py-5 text-center font-black w-32">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-red-50">
                <td colSpan="3" className="px-6 py-3 font-black text-red-900 text-sm border-y border-red-100">
                  I. CHARACTER (50%)
                </td>
              </tr>
              {CHARACTER_INDICATORS.map((item, i) => (
                <RenderRow key={i} item={item} index={i} />
              ))}

              <tr className="bg-red-50">
                <td colSpan="3" className="px-6 py-3 font-black text-red-900 text-sm border-y border-red-100">
                  II. COMPETENCE (50%)
                </td>
              </tr>
              {COMPETENCE_INDICATORS.map((item, i) => (
                <RenderRow key={i} item={item} index={i} offset={CHARACTER_INDICATORS.length} />
              ))}

              {/* Summary Row - MAROON BOX */}
              <tr className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white">
                <td className="px-6 py-6 text-right font-black text-lg uppercase">Total Final Rating</td>
                <td className="px-6 py-6 text-center font-black text-lg bg-red-800">100%</td>
                <td className="px-6 py-6 text-center">
                  <span className="text-2xl font-black text-yellow-400">{totalScore.toFixed(1)}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
          <h3 className="font-black text-black mb-4 flex items-center uppercase tracking-tight">
            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
            Further Recommendations for Growth
          </h3>
          <textarea
            name="recommendations"
            rows="4"
            value={formData.recommendations}
            onChange={handleInputChange}
            placeholder="Enter areas for improvement or positive feedback..."
            className="w-full border-2 border-zinc-100 p-4 rounded-xl focus:border-red-800 outline-none transition-all bg-zinc-50 text-black font-medium"
          />
        </div>

        {/* Signatures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Name of Evaluator', name: 'evaluator' },
            { label: 'Designation', name: 'designation' },
            { label: 'Date', name: 'date', type: 'date' },
            { label: 'Conforme', name: 'conforme' },
          ].map((field) => (
            <div key={field.name} className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
              <label className="block text-xs font-black text-red-800 uppercase mb-2">{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="w-full border-b-2 py-2 outline-none font-bold border-zinc-200 focus:border-red-800 text-black"
              />
            </div>
          ))}
        </div>

        {/* Action Button - MAROON BOX */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 disabled:bg-zinc-400 text-white py-6 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center space-x-3 transform active:scale-95"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span>SUBMIT OFFICIAL EVALUATION</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EvaluationS;
