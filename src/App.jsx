import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import { MainLayout } from './components/global/layouts/MainLayout';
import { GlobalHeader } from './components/global/elements/GlobalHeader';
import usePageTransition from './hooks/usePageTransition';

function App() {
  const { transitioning } = usePageTransition();
  const { pathname } = useLocation();
  const isAuthPath = pathname.startsWith('/auth');
  const isAdminPath = pathname.startsWith('/admin');
  const isEmployeePath = pathname.startsWith('/employee');
  const isClientPath = pathname.startsWith('/client');

  useEffect(() => {
    const body = document.body;
    if (isAuthPath) {
      body.classList.add('auth-body');
    } else {
      body.classList.remove('auth-body');
    }
    if (isAdminPath || isEmployeePath || isClientPath) {
      body.classList.add('admin-body');
    } else {
      body.classList.remove('admin-body');
    }
    return () => {
      body.classList.remove('auth-body');
      body.classList.remove('admin-body');
    };
  }, [isAdminPath, isEmployeePath, isClientPath, isAuthPath]);

  const pageClasses = ['page', transitioning ? 'transitioning' : null, isAuthPath ? 'auth-shell' : null]
    .filter(Boolean)
    .join(' ');

  return (
    <AuthProvider>
      <div className={pageClasses}>
        {isAuthPath ? (
          <AppRouter />
        ) : isAdminPath || isEmployeePath || isClientPath ? (
          <AppRouter />
        ) : (
          <MainLayout header={<GlobalHeader />}>
            <AppRouter />
          </MainLayout>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
