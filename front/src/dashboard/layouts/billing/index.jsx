// src/dashboard/layouts/billing/index.jsx
import React, { useState, useEffect } from "react";
import { useVisionUIController } from "context"; // Adjust import path
import Grid from "@mui/material/Grid";
import VuiBox from "components/VuiBox";
import MasterCard from "examples/Cards/MasterCard";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import PaymentMethod from "layouts/billing/components/PaymentMethod";
import Invoices from "layouts/billing/components/Invoices";
import BillingInformation from "layouts/billing/components/BillingInformation";
import Transactions from "layouts/billing/components/Transactions";
import CreditBalance from "./components/CreditBalance";
import ActivityLogs from "./components/ActivityLogs";
import axios from "axios";

function Billing() {
  const [controller, dispatch] = useVisionUIController();
  const { user } = controller;
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("User object:", user);
    const fetchActivityLogs = async () => {
      if (user?.role === "admin") {
        try {
          const response = await axios.get("http://localhost:3000/api/auth/activity-logs", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (response.data.success) {
            setActivityLogs(response.data.logs);
          }
        } catch (err) {
          setError("Failed to fetch activity logs.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [user]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox mt={4}>
        <VuiBox mb={1.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7} xl={8}>
              <Grid container spacing={3}>
                <Grid item xs={12} xl={6}>
                  <MasterCard number={7812213908237916} valid="05/24" cvv="09X" />
                </Grid>
                <Grid item xs={12} md={12} xl={6}>
                  <CreditBalance />
                </Grid>
                <Grid item xs={12}>
                  <PaymentMethod />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={5} xl={4}>
              <Invoices />
            </Grid>
          </Grid>
        </VuiBox>
        <VuiBox my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <BillingInformation />
            </Grid>
            <Grid item xs={12} md={5}>
              {user?.role === "admin" ? (
                loading ? (
                  <VuiBox>Loading activity logs...</VuiBox>
                ) : error ? (
                  <VuiBox color="error">{error}</VuiBox>
                ) : (
                  <ActivityLogs logs={activityLogs} />
                )
              ) : (
                <Transactions />
              )}
            </Grid>
          </Grid>
        </VuiBox>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Billing;