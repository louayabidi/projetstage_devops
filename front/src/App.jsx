import { Routes, Route, Navigate ,useLocation  } from "react-router-dom";
import React, { useEffect } from "react";
import Login from "./components/login";
import GitHubButton from "react-github-btn";
import Registration from "./components/registration";
import Home from "./components/home";
import Contact from "./components/Contact";
import CompleteBoatInfo from "./components/CompleteBoatInfo";
import DashboardLayout from "./dashboard/App.jsx";
import ProtectedRoute from './components/ProtectedRoute';
import Boats from './components/boat/Boats';
import EditBoatPage from './components/boat/EditBoatPage';
import BoatInfoPage from './components/boat/BoatInfoPage';
import BoatDetails from './components/boat/BoatDetails';
import ProfilePage from './components/User/ProfilePage';
import BoatOwnersList from './components/User/BoatOwnersList';
import BookingOffers from './components/booking/BookingOffers';
import BookingDetails from './components/booking/BookingDetails';
import ReservationPage from './components/booking/ReservationPage';
import Notifications from './components/booking/Notifications';
import Dashboard from "./dashboard/layouts/dashboard";
import Tables from "./dashboard/layouts/tables";

import Billing from "./dashboard/layouts/billing";
import RTL from "./dashboard/layouts/rtl";
import NotFound from "./components/NotFound";
import Profile from "./dashboard/layouts/profile";
import SignIn from "./dashboard/layouts/authentication/sign-in";
import SignUp from "./dashboard/layouts/authentication/sign-up";
import SignOut from "./dashboard/layouts/authentication/sign-out";
import BoatOwnerDetail from "./dashboard/layouts/tables/data/BoatOwnerDetail";
import Layout from "./components/Layout"; 
import OwnerCalendar from './components/booking/OwnerCalendar';
import ChangePassword from "./components/User/ChangePassword";
import FindCompanions from './components/travelInterest/FindCompanions';
import SubmitReview from './components/booking/SubmitReview';
import ActivityLogsPage from "./dashboard/layouts/activity-logs"; 
import { jwtDecode } from "jwt-decode";

function App() {



const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const provider = searchParams.get("provider");

    if (token && provider) {
      try {
        localStorage.setItem("token", token);
        const user = jwtDecode(token);
        localStorage.setItem("userId", user._id);

        // ✅ Clean URL (remove query params, stay on same path)
        window.history.replaceState({}, document.title, location.pathname);
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    }
  }, [location]);


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/registration" element={<Layout><Registration /></Layout>} />
      <Route path="/boats" element={<Layout><Boats /></Layout>} />
      <Route path="/boat-info" element={<Layout><BoatInfoPage /></Layout>} />
      <Route path="/boats/:id" element={<Layout><BoatDetails /></Layout>} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="*" element={<Layout><NotFound /></Layout>} ></Route>

<Route
  path="/find-companions"
  element={
    <ProtectedRoute>
      <Layout><FindCompanions /></Layout>
    </ProtectedRoute>
  }
/>

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        }
      />



      <Route
        path="/edit-boat"
        element={
          <ProtectedRoute>
            <Layout><EditBoatPage /></Layout>
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
  path="/calendar"
  element={
    <ProtectedRoute>
      <Layout><OwnerCalendar /></Layout>
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
        path="/bookings/:bookingId/review"
        element={
          <ProtectedRoute>
            <Layout><SubmitReview /></Layout>
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
        path="/complete-boat-info"
        element={
          <ProtectedRoute>
            <Layout><CompleteBoatInfo /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireBoatInfo>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tables" element={<Tables />} />
        <Route path="sign-out" element={<SignOut />} />
        <Route path="billing" element={<Billing />} />
        <Route path="rtl" element={<RTL />} />
        <Route path="profile" element={<Profile />} />
        <Route path="authentication/sign-in" element={<SignIn />} />
        <Route path="authentication/sign-up" element={<SignUp />} />
        <Route path="admin/users/:id" element={<BoatOwnerDetail />} />
        <Route path="activity-logs" element={<ActivityLogsPage />} />

      </Route>

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;