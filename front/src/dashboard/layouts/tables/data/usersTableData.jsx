import { useEffect, useState } from "react";
import axios from "axios";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiAvatar from "components/VuiAvatar";
import VuiBadge from "components/VuiBadge";
import { Button } from "@mui/material";
import { Link } from 'react-router-dom';

export default function useUsersTableData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(response.data.users);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);

const verifyBoatOwner = async (id) => {
  try {
    await axios.patch(`http://localhost:3000/api/auth/verify-boat-owner/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    fetchUsers(); 
  } catch (err) {
    alert("Failed to verify boat owner: " + err.message);
  }
};

  const columns = [
    { name: "user", align: "left" },
    { name: "role", align: "left" },
    { name: "status", align: "center" },
    { name: "registered", align: "center" },
    { name: "action", align: "center" },
  ];

  const rows = users.map(user => ({
    user: (
      <VuiBox display="flex" alignItems="center" px={1} py={0.5}>
        <VuiBox mr={2}>
          <VuiAvatar 
            src={user.avatar || "/default-avatar.png"} 
            alt={`${user.firstName} ${user.lastName}`} 
            size="sm" 
            variant="rounded" 
          />
        </VuiBox>
        <VuiBox display="flex" flexDirection="column">
          <VuiTypography variant="button" color="white" fontWeight="medium">
            {user.firstName} {user.lastName}
          </VuiTypography>
          <VuiTypography variant="caption" color="text">
            {user.email}
          </VuiTypography>
        </VuiBox>
      </VuiBox>
    ),
    role: (
      <VuiTypography variant="caption" color="white" fontWeight="medium">
        {user.role}
      </VuiTypography>
    ),
    status: (
      <VuiBadge
        variant="standard"
        badgeContent={user.verified ? "Verified" : "Pending"}
        color={user.verified ? "success" : "warning"}
        size="xs"
        container
      />
    ),
    registered: (
      <VuiTypography variant="caption" color="white" fontWeight="medium">
        {new Date(user.createdAt).toLocaleDateString()}
      </VuiTypography>
    ),
    action: (
      <>
        {user.role === "boat_owner" && !user.verified ? (
          <Button 
            size="small" 
            color="success" 
            variant="contained"
            onClick={() => verifyBoatOwner(user._id)}
          >
            Verify
          </Button>
        ) : (
         <VuiTypography
  component={Link}
  to={`/dashboard/admin/users/${user._id}`}
  variant="caption"
  color="text"
  fontWeight="medium"
>
  Details
</VuiTypography>
        )}
      </>
    )
  }));

  return { columns, rows, loading, error };
}
