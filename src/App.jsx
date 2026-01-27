import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import { useAuth, useInactivityLogout } from './Context/AuthContext';

/* =========================
   PUBLIC PAGES
========================= */
import Login from './Components/LogIn';
import NoPageFound from './Pages/NoPageFound';

/* =========================
   LAYOUTS
========================= */
import AdviserLayout from './Pages/layout/AdviserLayout';
import CoordinatorLayout from './Pages/layout/CoordinatorLayout';
import InternLayout from './Pages/layout/InternLayout';
import Layout from './Pages/layout/Layout';
import SupervisorLayout from './Pages/layout/SupervisorLayout';

/* =========================
   PAGES
========================= */
import AddCoordinator from './Pages/AddCoordinator';
import AddNewCompany from './Pages/CoordinatorPages/AddNewCompany';
import AdviserC from './Pages/CoordinatorPages/AdviserC';
import DashboardC from './Pages/CoordinatorPages/DashboardC';
import HTEC from './Pages/CoordinatorPages/HTEC';
import InternC from './Pages/CoordinatorPages/InternC';
import ProfileC from './Pages/CoordinatorPages/ProfileC';
import ReportsC from './Pages/CoordinatorPages/ReportsC';

import AddIntern from './Pages/AdviserPages/AddIntern';
import DashboardA from './Pages/AdviserPages/DashboardA';
import HTEA from './Pages/AdviserPages/HTEA';
import InternA from './Pages/AdviserPages/InternA';
import ProfileA from './Pages/AdviserPages/ProfileA';
import ReportsA from './Pages/AdviserPages/ReportsA';

import ConsentForm from './Forms/ConsentForm';
import Documents from './Pages/InternPages/Documents';
import Evaluation from './Pages/InternPages/Evaluation';
import HomeI from './Pages/InternPages/HomeI';
import HTE_Evaluation from './Pages/InternPages/InternToHTE';
import SupervisorEvaluation from './Pages/InternPages/InternToSupervisor';
import Jornal from './Pages/InternPages/Journal';
import ProfileI from './Pages/InternPages/ProfileI';

import DashboardS from './Pages/SupervisorPages/DashboardS';
import EvaluationS from './Pages/SupervisorPages/EvaluationS';
import ProfileS from './Pages/SupervisorPages/ProfileS';

export default function App() {
  const { user } = useAuth();

  // ✅ ALWAYS call hook (no condition)
  useInactivityLogout(5);

  return (
    <Routes>
      {/* =========================
         PUBLIC ROUTES
      ========================= */}
      <Route path="/" element={<Login />} />
      <Route path="/pup-sinag" element={<Login />} />

      {/* =========================
         SUPER ADMIN
      ========================= */}
      <Route
        path="/pup-sinag/superadmin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <AddCoordinator />
          </ProtectedRoute>
        }
      />

      {/* =========================
         PROTECTED ROUTES
      ========================= */}
      <Route path="/pup-sinag" element={<Layout />}>
        {/* COORDINATOR */}
        <Route
          path="coordinator"
          element={
            <ProtectedRoute allowedRoles={['coordinator']}>
              <CoordinatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardC />} />
          <Route path="dashboard" element={<DashboardC />} />
          <Route path="adviser" element={<AdviserC />} />
          <Route path="interns" element={<InternC />} />
          <Route path="HTE" element={<HTEC />} />
          <Route path="newcompany" element={<AddNewCompany />} />
          <Route path="reports" element={<ReportsC />} />
          <Route path="profile" element={<ProfileC />} />
        </Route>

        {/* ADVISER */}
        <Route
          path="adviser"
          element={
            <ProtectedRoute allowedRoles={['adviser']}>
              <AdviserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardA />} />
          <Route path="dashboard" element={<DashboardA />} />
          <Route path="interns" element={<InternA />} />
          <Route path="HTE" element={<HTEA />} />
          <Route path="addIntern" element={<AddIntern />} />
          <Route path="reports" element={<ReportsA />} />
          <Route path="profile" element={<ProfileA />} />
        </Route>

        {/* INTERN */}
        <Route
          path="intern"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <InternLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeI />} />
          <Route path="home" element={<HomeI />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<ProfileI />} />
          <Route path="journal" element={<Jornal />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="hte-evaluation" element={<HTE_Evaluation />} />
          <Route path="supervisor-evaluation" element={<SupervisorEvaluation />} />
          <Route path="consent-form" element={<ConsentForm />} />
        </Route>

        {/* SUPERVISOR */}
        <Route
          path="supervisor"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardS />} />
          <Route path="dashboard" element={<DashboardS />} />
          <Route path="evaluation/:studentId" element={<EvaluationS />} />
          <Route path="profile" element={<ProfileS />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NoPageFound />} />
    </Routes>
  );
}
