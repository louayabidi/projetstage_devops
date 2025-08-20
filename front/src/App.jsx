// src/App.jsx
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
import CreateBooking from './components/booking/CreateBooking'; 
import BookingRequests from './components/booking/BookingRequests'; 
import BookingOffers from './components/booking/BookingOffers';
import BookingDetails from './components/booking/BookingDetails'; 
import ReservationPage from './components/booking/ReservationPage'; 


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />   
      <Route path="/login" element={<Login />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
      <Route path="/boatowner" element={<Layout><BoatOwnersList /></Layout>} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/Boats" element={<Layout><Boats /></Layout>} />
      <Route path="/boats/:id" element={<Layout><BoatDetails /></Layout>} />
       <Route path="/reservation/:boatId" element={<ReservationPage />} />
      {/* Booking Routes */}
      <Route path="/create-booking" element={<Layout><CreateBooking /></Layout>} />
      <Route path="/booking-requests" element={<Layout><BookingRequests /></Layout>} />
      <Route path="/booking-offers" element={<Layout><BookingOffers /></Layout>} />
      <Route path="/bookings/:id" element={<Layout><BookingDetails /></Layout>} />
      
      <Route path="/dashboard/*" element={
        <ProtectedRoute requireBoatInfo>
          <Dashboard />
        </ProtectedRoute>
      } />    
      
      <Route path="/complete-boat-info" element={<Layout><CompleteBoatInfo /></Layout>} />
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;