import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Registration from "./components/registration";
import Home from "./components/home";
import Contact from "./components/Contact";
import CompleteBoatInfo from "./components/CompleteBoatInfo";
import Dashboard from "./dashboard/App.jsx";
import Layout from "./components/Layout";
import ProtectedRoute from './components/ProtectedRoute';
import Boats from './components/boat/Boats';
import BoatDetails from './components/boat/BoatDetails';
import ProfilePage from './components/User/ProfilePage';
import BoatOwnersList from './components/User/BoatOwnersList';
import BookingOffers from './components/booking/BookingOffers';
import BookingDetails from './components/booking/BookingDetails';
import ReservationPage from './components/booking/ReservationPage';
import Notifications from './components/booking/Notifications'; 

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/boats" element={<Layout><Boats /></Layout>} />
      <Route path="/boats/:id" element={<Layout><BoatDetails /></Layout>} />

      {/* Protected Routes (assuming authentication required) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/boatowner"
        element={
          <ProtectedRoute>
            <Layout><BoatOwnersList /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservation/:boatId"
        element={
          <ProtectedRoute>
            <Layout><ReservationPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-offers"
        element={
          <ProtectedRoute>
            <Layout><BookingOffers /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <Layout><BookingDetails /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute requireBoatInfo>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complete-boat-info"
        element={
          <ProtectedRoute>
            <Layout><CompleteBoatInfo /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;