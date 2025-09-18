import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiBadge from "components/VuiBadge";
import VuiButton from "components/VuiButton";
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
  const [rejectionReasons, setRejectionReasons] = useState({});

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3000";

  // Updated fetchUsers with correct endpoint and enhanced logging
  const fetchUsers = async (page = 1, limit = 100) => { // Added pagination params
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        setError("Authentication token not found");
        setLoading(false);
        toast.error("Please log in again");
        navigate("/login");
        return;
      }

      console.log("Fetching users with token:", token.slice(0, 20) + "...");
      // ✅ Changed endpoint to match your working Postman test
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit }, // Optional: Add pagination if backend supports it
      });

      console.log("Full fetched users response:", response); // Enhanced logging
      console.log("Response data:", response.data);

      // ✅ Enhanced handling for response structure
      let users = response.data.users || response.data.data || response.data || [];
      if (!Array.isArray(users)) {
        console.warn("Response data is not an array:", users);
        users = [];
      }

      console.log("Processed users array:", users.length, "users found");

      const formattedRows = users.map((user) => {
        const userId = String(user._id);

        return {
          name: (
            <VuiBox>
              <Link to={`/dashboard/admin/users/${userId}`}>
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
            <VuiBox
              display="flex"
              gap={1}
              alignItems="center"
              key={`action-${userId}`}
            >
              {user.role === "boat_owner" && !user.verified && !user.rejected && (
                <>
                  <VuiButton
                    variant="gradient"
                    color="primary"
                    size="small"
                    onClick={() => verifyBoatOwner(userId)}
                    disabled={actionLoading[userId]}
                  >
                    {actionLoading[userId] ? "Verifying..." : "Verify"}
                  </VuiButton>

                  <select
                    value={rejectionReasons[userId] || ""}
                    onChange={(e) => {
                      const newReason = e.target.value;
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [userId]: newReason,
                      }));
                    }}
                    style={{
                      padding: "8px",
                      backgroundColor: "#444",
                      color: "#fff",
                      border: "1px solid #aaa",
                      borderRadius: "4px",
                      marginRight: "8px",
                    }}
                  >
                    <option value="">Select Rejection Reason</option>
                    <option value="Missing license details">
                      Missing license details
                    </option>
                    <option value="Incomplete boat info">
                      Incomplete boat info
                    </option>
                    <option value="Invalid documentation">
                      Invalid documentation
                    </option>
                    <option value="Other">Other</option>
                  </select>

                  <button
                    key={`reject-${userId}`}
                    onClick={() => handleReject(userId)}
                    disabled={!rejectionReasons[userId]?.trim()}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#d32f2f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: rejectionReasons[userId]?.trim()
                        ? "pointer"
                        : "not-allowed",
                      opacity: rejectionReasons[userId]?.trim() ? 1 : 0.5,
                    }}
                  >
                    {actionLoading[userId] ? "Rejecting..." : "Reject"}
                  </button>
                </>
              )}
            </VuiBox>
          ),
        };
      });

      setRows(formattedRows);
      setLoading(false);
      console.log("Users table updated, rows:", formattedRows.length);
    } catch (err) {
      console.error("Fetch users error:", err.response || err);
      // ✅ Enhanced error logging
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(errorMsg);
      setLoading(false);
      toast.error(errorMsg);
    }
  };

  // ✅ Added refetch function for manual refresh (e.g., after actions)
  const refetch = () => {
    setLoading(true);
    fetchUsers();
  };

  const verifyBoatOwner = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/${userId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        refetch(); // Use refetch instead of fetchUsers for consistency
      } else {
        setError(response.data.message || "Failed to verify boat owner");
        toast.error(response.data.message || "Failed to verify boat owner");
      }
    } catch (err) {
      console.error("Verify error:", err);
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
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/${userId}/reject`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setRejectionReasons((prev) => ({ ...prev, [userId]: "" }));
        refetch(); 
      } else {
        throw new Error(response.data.message || "Failed to reject boat owner");
      }
    } catch (err) {
      console.error("Reject error:", err);
      setError(err.response?.data?.message || "Failed to reject boat owner");
      toast.error(err.response?.data?.message || "Failed to reject boat owner");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    const reason = rejectionReasons[userId];
    if (!reason) {
      toast.error("Please select a rejection reason");
      return;
    }

    try {
      await rejectBoatOwner(userId, reason);
    } catch (err) {
      console.error("Error in handleReject:", err);
    }
  };

  useEffect(() => {
    fetchUsers(); 
  }, []);

  useEffect(() => {
    console.log("Current rejectionReasons state:", rejectionReasons);
    console.log("Current actionLoading state:", actionLoading);
  }, [rejectionReasons, actionLoading]);

  return {
    columns,
    rows,
    loading,
    error,
    refetch, // New: For manual refresh
  };
};

export default useUsersTableData;