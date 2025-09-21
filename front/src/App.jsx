import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useEffect, Suspense, lazy } from "react";
import { jwtDecode } from "jwt-decode";


const Login = lazy(() => import("./components/login"));
const Registration = lazy(() => import("./components/registration"));
const Home = lazy(() => import("./components/home"));
const Contact = lazy(() => import("./components/Contact"));
const CompleteBoatInfo = lazy(() => import("./components/CompleteBoatInfo"));
const DashboardLayout = lazy(() => import("./dashboard/App.jsx"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Boats = lazy(() => import("./components/boat/Boats"));
const EditBoatPage = lazy(() => import("./components/boat/EditBoatPage"));
const BoatInfoPage = lazy(() => import("./components/boat/BoatInfoPage"));
const BoatDetails = lazy(() => import("./components/boat/BoatDetails"));
const ProfilePage = lazy(() => import("./components/User/ProfilePage"));
const BoatOwnersList = lazy(() => import("./components/User/BoatOwnersList"));
const BookingOffers = lazy(() => import("./components/booking/BookingOffers"));
const BookingDetails = lazy(() => import("./components/booking/BookingDetails"));
const ReservationPage = lazy(() => import("./components/booking/ReservationPage"));
const Notifications = lazy(() => import("./components/booking/Notifications"));
const Dashboard = lazy(() => import("./dashboard/layouts/dashboard"));
const Tables = lazy(() => import("./dashboard/layouts/tables"));
const Billing = lazy(() => import("./dashboard/layouts/billing"));
const RTL = lazy(() => import("./dashboard/layouts/rtl"));
const NotFound = lazy(() => import("./components/NotFound"));
const Profile = lazy(() => import("./dashboard/layouts/profile"));
const SignIn = lazy(() => import("./dashboard/layouts/authentication/sign-in"));
const SignUp = lazy(() => import("./dashboard/layouts/authentication/sign-up"));
const SignOut = lazy(() => import("./dashboard/layouts/authentication/sign-out"));
const BoatOwnerDetail = lazy(() => import("./dashboard/layouts/tables/data/BoatOwnerDetail"));
const Layout = lazy(() => import("./components/Layout"));
const OwnerCalendar = lazy(() => import("./components/booking/OwnerCalendar"));
const ChangePassword = lazy(() => import("./components/User/ChangePassword"));
const FindCompanions = lazy(() => import("./components/travelInterest/FindCompanions"));
const SubmitReview = lazy(() => import("./components/booking/SubmitReview"));
const ActivityLogsPage = lazy(() => import("./dashboard/layouts/activity-logs"));

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
        // Clean URL (remove query params, stay on same path)
        window.history.replaceState({}, document.title, location.pathname);
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    }
  }, [location]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
        <Route path="*" element={<Layout><NotFound /></Layout>} />

        {/* Protected Routes */}
        <Route
          path="/find-companions"
          element={
            <ProtectedRoute>
              <Layout><FindCompanions /></Layout>
            </ProtectedRoute>
          }
        />
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
    </Suspense>
  );
}

export default App;