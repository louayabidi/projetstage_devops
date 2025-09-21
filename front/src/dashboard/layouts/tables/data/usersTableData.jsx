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
  const [users, setUsers] = useState([]); // 🔥 store raw users, not JSX
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:3000";

  // ===== Helpers =====
  const handleDownloadLicense = async (boatId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        navigate("/login");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/boats/${boatId}/license`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `boat_license_${boatId}.${response.headers["content-type"].split("/")[1]}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download license error:", err);
      toast.error(err.response?.data?.message || "Failed to download license");
    }
  };

  const fetchUsers = async (page = 1, limit = 100) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        toast.error("Please log in again");
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      });

      let usersData = response.data.users || response.data.data || response.data || [];
      if (!Array.isArray(usersData)) {
        usersData = [];
      }

      setUsers(usersData); // 🔥 store raw data
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(errorMsg);
      setLoading(false);
      toast.error(errorMsg);
    }
  };

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
        refetch();
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
    await rejectBoatOwner(userId, reason);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== Build rows dynamically =====
  const rows = users.map((user) => {
    const userId = user._id.toString();

    return {
      name: (
        <VuiBox>
          <Link to={`/dashboard/admin/users/${userId}`}>
            <VuiTypography variant="button" color="white" fontWeight="medium" sx={{ textDecoration: "underline" }}>
              {`${user.firstName} ${user.lastName}`}
            </VuiTypography>
          </Link>
        </VuiBox>
      ),
      email: <VuiTypography variant="button" color="white">{user.email}</VuiTypography>,
      role: <VuiTypography variant="button" color="white">{user.role}</VuiTypography>,
      boatInfo: (
        <VuiBox>
          {user.role === "boat_owner" && user.boatInfoComplete ? (
            <>
              <VuiTypography variant="button" color="white">
                {user.boat?.name || "Boat Info Available"}
              </VuiTypography>
              {user.boat?._id && (
                <VuiButton
                  variant="gradient"
                  color="info"
                  size="small"
                  onClick={() => handleDownloadLicense(user.boat._id)}
                  sx={{ ml: 1 }}
                >
                  Download License
                </VuiButton>
              )}
            </>
          ) : (
            <VuiTypography variant="button" color="white">N/A</VuiTypography>
          )}
        </VuiBox>
      ),
      status: (
        <VuiBadge
          variant="gradient"
          badgeContent={user.verified ? "Verified" : user.rejected ? "Rejected" : "Unverified"}
          color={user.verified ? "success" : user.rejected ? "error" : "warning"}
          size="xs"
          container
        />
      ),
      action: (
        <VuiBox display="flex" gap={1} alignItems="center" key={`action-${userId}`}>
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
                  setRejectionReasons((prev) => ({ ...prev, [userId]: newReason }));
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
                <option value="Missing license details">Missing license details</option>
                <option value="Incomplete boat info">Incomplete boat info</option>
                <option value="Invalid documentation">Invalid documentation</option>
                <option value="Other">Other</option>
              </select>

              <button
                key={`reject-${userId}`}
                onClick={() => handleReject(userId)}
                disabled={!rejectionReasons[userId]} // 🔥 now works reactively
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: rejectionReasons[userId] ? "pointer" : "not-allowed",
                  opacity: rejectionReasons[userId] ? 1 : 0.5,
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

  return { columns, rows, loading, error, refetch };
};

export default useUsersTableData;
