import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/edit-property/:id" element={<AddProperty />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
