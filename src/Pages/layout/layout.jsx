import { Outlet, useLocation } from 'react-router-dom';
import Header from '../../Components/Header';
import { useAuth } from '../../Context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Hide header on login pages
  const isLoginPage =
    location.pathname === '/' ||
    location.pathname === '/pup-sinag' ||
    location.pathname.startsWith('/login');

  // Show header ONLY when logged in
  const shouldShowHeader = !loading && user && !isLoginPage;

  return (
    <>
      {shouldShowHeader && <Header />}
      <Outlet />
    </>
  );
};

export default Layout;
