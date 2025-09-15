// src/dashboard/layouts/billing/components/ActivityLogs.jsx
import React from "react";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import { Accordion, AccordionSummary, AccordionDetails, Grid } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import colors from "dashboard-assets/theme/base/colors";
import borders from "dashboard-assets/theme/base/borders";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

function ActivityLogs({ logs }) {
  const { grey, success, warning, error: errorColor, info } = colors;
  const { borderRadius } = borders;

  // Color coding based on action type
  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN":
        return success.main;
      case "SIGNUP":
        return info.main;
      case "LOGOUT":
        return warning.main;
      case "REJECT":
      case "DELETE":
        return errorColor.main;
      default:
        return grey[500];
    }
  };

  return (
    <VuiBox>
      <VuiTypography variant="h5" color="white" fontWeight="medium" mb={3} textGradient>
        Activity Logs
      </VuiTypography>
      <Grid container spacing={2}>
        {logs.map((log) => (
          <Grid item xs={12} key={log._id}>
            <Accordion
              sx={{
                background: "linear-gradient(135deg, #1A2035 0%, #2A3452 100%)",
                borderRadius: borderRadius.lg,
                boxShadow: 3,
                "&:before": { display: "none" },
                "&:hover": { boxShadow: 6 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                aria-controls={`panel-${log._id}-content`}
                id={`panel-${log._id}-header`}
                sx={{ p: 2 }}
              >
                <VuiBox display="flex" justifyContent="space-between" width="100%" alignItems="center">
                  <VuiBox>
                    <VuiTypography variant="h6" color="white" fontWeight="bold">
                      {log.userId?.email || "Unknown User"}
                    </VuiTypography>
                    <VuiTypography variant="caption" color="text">
                      {new Date(log.createdAt).toLocaleString()}
                    </VuiTypography>
                  </VuiBox>
                  <VuiBox display="flex" alignItems="center">
                    <Tooltip title={`Action: ${log.action}`} placement="top">
                      <VuiTypography
                        variant="h6"
                        color={getActionColor(log.action)}
                        fontWeight="medium"
                        sx={{ ml: 2 }}
                      >
                        {log.action}
                      </VuiTypography>
                    </Tooltip>
                  </VuiBox>
                </VuiBox>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, backgroundColor: "grey-900" }}>
                <VuiBox>
                  <VuiTypography variant="body2" color="white" mb={1}>
                    <strong>IP Address:</strong> {log.ipAddress || "N/A"}
                  </VuiTypography>
                  <VuiTypography variant="body2" color="white" mb={1}>
                    <strong>User Agent:</strong> {log.userAgent || "N/A"}
                  </VuiTypography>
                  {log.bookingId && (
                    <VuiTypography variant="body2" color="white" mb={1}>
                      <strong>Booking Type:</strong> {log.bookingId.reservationType || "N/A"}
                    </VuiTypography>
                  )}
                </VuiBox>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </VuiBox>
  );
}

export default ActivityLogs;