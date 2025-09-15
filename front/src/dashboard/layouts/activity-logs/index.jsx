/*!

=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim[](https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import VuiInput from "components/VuiInput";
import ActivityLogs from "../billing/components/ActivityLogs";
import { useVisionUIController } from "context";
import axios from "axios";
import { Card, Grid, CircularProgress, Icon, Tooltip } from "@mui/material";
import colors from "dashboard-assets/theme/base/colors";
import borders from "dashboard-assets/theme/base/borders";

function ActivityLogsPage() {
  const [controller] = useVisionUIController();
  const { user, userLoading } = controller;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { grey, info, error: errorColor } = colors;
  const { borderRadius } = borders;
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User object in ActivityLogsPage:", user, "UserLoading:", userLoading);
    const fetchLogs = async () => {
      if (userLoading) return;

      if (!user) {
        setError("Please log in to view activity logs.");
        setLoading(false);
        navigate("/login");
        return;
      }

      if (user?.role === "admin") {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Authentication token missing. Please log in again.");
            setLoading(false);
            navigate("/login");
            return;
          }

          const res = await axios.get("http://localhost:3000/api/auth/activity-logs", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("API Response:", res.data);
          if (res.data.success) {
            setLogs(res.data.logs);
          } else {
            setError("Failed to load activity logs.");
          }
        } catch (err) {
          console.error("Error fetching logs:", err.response?.data || err.message);
          setError("An error occurred while fetching activity logs.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("You do not have permission to view activity logs.");
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user, userLoading, navigate]);

  const handleRefresh = () => {
    if (userLoading) return;
    if (!user) {
      setError("Please log in to refresh activity logs.");
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    fetchLogs();
  };

  const filteredLogs = logs.filter((log) =>
    log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug theme colors
  console.log("Theme colors:", colors);
  console.log("Info color:", colors.info);
  console.log("Info gradients:", colors.gradients?.info);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox mt={4}>
        <Card>
          <VuiBox p="22px" bgColor="info" borderRadius={borderRadius.lg} boxShadow="lg">
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="16px">
              <VuiTypography variant="h4" fontWeight="bold" color="white" textGradient>
                Activity Logs
              </VuiTypography>
              {user?.role === "admin" && !userLoading && (
                <Tooltip title="Refresh Logs" placement="top">
                  <VuiButton
                    variant="gradient"
                    color={colors.info && colors.gradients?.info ? "info" : "primary"} // Use primary as fallback
                    onClick={handleRefresh}
                  >
                    <Icon sx={{ mr: 1 }}>refresh</Icon> Refresh
                  </VuiButton>
                </Tooltip>
              )}
            </VuiBox>
            {user?.role === "admin" && !userLoading && (
              <VuiInput
                placeholder="Search by user, action, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={{ component: "search", direction: "left" }}
                sx={{ mb: 2, width: "300px" }}
              />
            )}
          </VuiBox>
          <VuiBox p="0 22px 22px">
            {userLoading || loading ? (
              <VuiBox display="flex" justifyContent="center" alignItems="center" minHeight="200px" bgColor="grey-800" borderRadius={borderRadius.lg} p={3}>
                <CircularProgress color="info" size={40} />
                <VuiTypography ml={2} variant="h6" color="white">
                  Loading activity logs...
                </VuiTypography>
              </VuiBox>
            ) : error ? (
              <VuiBox
                border="2px solid"
                borderRadius={borderRadius.lg}
                borderColor={errorColor.main}
                p="22px"
                textAlign="center"
                bgColor="grey-900"
              >
                <VuiTypography variant="h6" color="error" fontWeight="medium">
                  {error}
                </VuiTypography>
                {!user && (
                  <VuiButton
                    variant="gradient"
                    color={colors.info && colors.gradients?.info ? "info" : "primary"} // Fallback to primary
                    onClick={() => navigate("/login")}
                    sx={{ mt: 2 }}
                  >
                    Go to Login
                  </VuiButton>
                )}
              </VuiBox>
            ) : filteredLogs.length === 0 ? (
              <VuiBox
                border="2px solid"
                borderRadius={borderRadius.lg}
                borderColor={grey[600]}
                p="22px"
                textAlign="center"
                bgColor="grey-900"
              >
                <VuiTypography variant="h6" color="white">
                  No activity logs available.
                </VuiTypography>
              </VuiBox>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ActivityLogs logs={filteredLogs} />
                </Grid>
              </Grid>
            )}
          </VuiBox>
        </Card>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ActivityLogsPage;