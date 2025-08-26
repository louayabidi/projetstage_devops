import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiBadge from "components/VuiBadge";
import VuiButton from "components/VuiButton";

const useUsersTableData = () => {
  const [columns, setColumns] = useState([
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

  const API_BASE_URL = "http://localhost:3000"; // Adjust to your backend port

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = response.data.users;

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
            badgeContent={user.verified ? "Verified" : "Unverified"}
            color={user.verified ? "success" : "warning"}
            size="xs"
            container
          />
        ),
        action: (
          <VuiBox>
            {user.role === "boat_owner" && !user.verified && (
              <VuiButton
                variant="gradient"
                color="primary"
                size="small"
                onClick={() => verifyBoatOwner(user._id)}
                disabled={actionLoading[user._id]}
              >
                {actionLoading[user._id] ? "Verifying..." : "Verify"}
              </VuiButton>
            )}
          </VuiBox>
        ),
      }));

      setRows(formattedRows);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  const verifyBoatOwner = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchUsers();
      } else {
        setError(response.data.message || "Failed to verify boat owner");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify boat owner");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { columns, rows, loading, error };
};

export default useUsersTableData;