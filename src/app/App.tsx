import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './AuthContext';
import './prototype.css';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import PrototypeApp from './PrototypeApp';

function routerBasename() {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return undefined;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <PrototypeApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
