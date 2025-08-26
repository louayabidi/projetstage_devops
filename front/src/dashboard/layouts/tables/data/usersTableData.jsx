import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiBadge from "components/VuiBadge";
import VuiButton from "components/VuiButton";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";

const useUsersTableData = () => {
  const [columns] = useState([
    { name: "name", align: "left" },
    { name: "email", align: "left" },
    { name: "role", align: "center" },
    { name: "boatInfo", align: "center" },
    { name: "status", align: "center" },
    { name: "action", align: "center" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const API_BASE_URL = "http://localhost:3000";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched users response:", response.data);

      const users = response.data.users || [];
      if (!Array.isArray(users)) {
        throw new Error("Expected an array of users");
      }

      const formattedRows = users.map((user) => ({
        name: (
          <VuiBox>
            <Link to={`/dashboard/admin/users/${user._id}`}>
              <VuiTypography
                variant="button"
                color="white"
                fontWeight="medium"
                sx={{ textDecoration: "underline" }}
              >
                {`${user.firstName} ${user.lastName}`}
              </VuiTypography>
            </Link>
          </VuiBox>
        ),
        email: (
          <VuiTypography variant="button" color="white" fontWeight="medium">
            {user.email}
          </VuiTypography>
        ),
        role: (
          <VuiTypography variant="button" color="white" fontWeight="medium">
            {user.role}
          </VuiTypography>
        ),
        boatInfo: (
          <VuiTypography variant="button" color="white" fontWeight="medium">
            {user.role === "boat_owner" && user.boatInfoComplete
              ? user.boat?.name || "Boat Info Available"
              : "N/A"}
          </VuiTypography>
        ),
        status: (
          <VuiBadge
            variant="gradient"
            badgeContent={
              user.verified ? "Verified" : user.rejected ? "Rejected" : "Unverified"
            }
            color={user.verified ? "success" : user.rejected ? "error" : "warning"}
            size="xs"
            container
          />
        ),
        action: (
          <VuiBox display="flex" gap={2}>
            {user.role === "boat_owner" && !user.verified && !user.rejected && (
              <>
                <VuiButton
                  variant="gradient"
                  color="primary"
                  size="small"
                  onClick={() => verifyBoatOwner(user._id)}
                  disabled={actionLoading[user._id]}
                >
                  {actionLoading[user._id] ? "Verifying..." : "Verify"}
                </VuiButton>
                <VuiButton
                  variant="gradient"
                  color="error"
                  size="small"
                  onClick={() => {
                    setSelectedUserId(user._id);
                    setShowRejectModal(true);
                  }}
                >
                  Reject
                </VuiButton>
              </>
            )}
          </VuiBox>
        ),
      }));

      setRows(formattedRows);
      setLoading(false);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || `Failed to fetch users: ${err.message}`);
      setLoading(false);
    }
  };

  const verifyBoatOwner = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchUsers();
      } else {
        setError(response.data.message || "Failed to verify boat owner");
        toast.error(response.data.message || "Failed to verify boat owner");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify boat owner");
      toast.error(err.response?.data?.message || "Failed to verify boat owner");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const rejectBoatOwner = async (userId, reason) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        toast.error("Authentication token not found");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchUsers();
      } else {
        setError(response.data.message || "Failed to reject boat owner");
        toast.error(response.data.message || "Failed to reject boat owner");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject boat owner");
      toast.error(err.response?.data?.message || "Failed to reject boat owner");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    columns,
    rows,
    loading,
    error,
    rejectModal: (
      <Dialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        sx={{ "& .MuiDialog-paper": { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#fff" } }}
      >
        <DialogTitle>Reject Boat Owner</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#aaa" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#aaa" },
                "&:hover fieldset": { borderColor: "#fff" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectModal(false)} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!rejectionReason.trim()) {
                setError("Rejection reason is required");
                toast.error("Rejection reason is required");
                return;
              }
              await rejectBoatOwner(selectedUserId, rejectionReason);
              setShowRejectModal(false);
              setRejectionReason("");
            }}
            sx={{
              color: "#fff",
              backgroundColor: "#d32f2f",
              "&:hover": { backgroundColor: "#b71c1c" },
            }}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    ),
  };
};

export default useUsersTableData;