import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import CropDetail from './pages/CropDetail';
import AddCrop from './pages/AddCrop';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import MarketPrices from './pages/MarketPrices';
import OrderTracking from './pages/OrderTracking';
import WalletPage from './pages/WalletPage';
import CropRecommendations from './pages/CropRecommendations';
import FarmerAnalytics from './pages/FarmerAnalytics';
import PreOrders from './pages/PreOrders';
import NearbySearch from './pages/NearbySearch';
import Favorites from './pages/Favorites';

// Auth gate: redirect to login if not authenticated, or dashboard if authenticated
function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function AppContent() {
  return (
    <Router>
      <SocketProvider>
        <NotificationProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<AuthGate />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/crop/:id" element={<CropDetail />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/nearby" element={<NearbySearch />} />
              <Route path="/add-crop" element={
                <ProtectedRoute roles={['farmer']}>
                  <AddCrop />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/order/:id" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute roles={['farmer']}>
                  <CropRecommendations />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute roles={['farmer']}>
                  <FarmerAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/preorders" element={
                <ProtectedRoute>
                  <PreOrders />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </NotificationProvider>
      </SocketProvider>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
