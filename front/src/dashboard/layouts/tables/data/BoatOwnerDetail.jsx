import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton"; // Added for download button
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { toast } from "react-toastify"; // Added for error notifications

function BoatOwnerDetail() {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = "http://localhost:3000";

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        toast.error("Please log in again");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/${id}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User details response:", response.data); // Log to verify data
      setUserDetails(response.data.user);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user details");
      setLoading(false);
      console.error("Fetch details error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch user details");
    }
  };

  const handleDownloadLicense = async (boatId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/boats/${boatId}/license`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `boat_license_${boatId}.${response.headers["content-type"].split("/")[1]}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("License downloaded successfully");
    } catch (err) {
      console.error("Download license error:", err);
      toast.error(err.response?.data?.message || "Failed to download license");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center">
          <VuiTypography variant="h6" color="white">
            Loading...
          </VuiTypography>
        </VuiBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center">
          <VuiTypography variant="h6" color="error">
            {error}
          </VuiTypography>
        </VuiBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <Card sx={{ padding: 3, backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
          <VuiTypography variant="h4" color="white" mb={2}>
            User Details
          </VuiTypography>
          {userDetails && (
            <Grid container spacing={3}>
              {/* User Profile Section */}
              <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
                <VuiBox display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    src={userDetails.photo || "/default-avatar.png"}
                    alt={`${userDetails.firstName} ${userDetails.lastName}`}
                    sx={{ width: 120, height: 120, mb: 2, border: "2px solid #fff" }}
                  />
                  <VuiTypography variant="h5" color="white" fontWeight="bold">
                    {userDetails.firstName} {userDetails.lastName}
                  </VuiTypography>
                  <Chip
                    label={userDetails.role.replace("_", " ").toUpperCase()}
                    color={userDetails.role === "boat_owner" ? "primary" : "secondary"}
                    sx={{ mt: 1, color: "#fff" }}
                  />
                </VuiBox>
              </Grid>

              {/* User Info Section */}
              <Grid item xs={12} md={8}>
                <VuiBox>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={<VuiTypography color="white" variant="body1">Email</VuiTypography>}
                        secondary={
                          <VuiTypography color="text" variant="body2">
                            {userDetails.email}
                          </VuiTypography>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={<VuiTypography color="white" variant="body1">Phone Number</VuiTypography>}
                        secondary={
                          <VuiTypography color="text" variant="body2">
                            {userDetails.phoneNumber || "Not provided"}
                          </VuiTypography>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={<VuiTypography color="white" variant="body1">Status</VuiTypography>}
                        secondary={
                          <Chip
                            label={userDetails.verified ? "Verified" : "Unverified"}
                            color={userDetails.verified ? "success" : "warning"}
                            size="small"
                            sx={{ color: "#fff" }}
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </VuiBox>
              </Grid>

              {/* Boat Info Section (for Boat Owners) */}
              {userDetails.role === "boat_owner" && userDetails.boat && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.3)", my: 2 }} />
                    <VuiTypography variant="h5" color="white" mb={2}>
                      Boat Information
                    </VuiTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <VuiBox>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary={<VuiTypography color="white" variant="body1">Boat Name</VuiTypography>}
                            secondary={
                              <VuiTypography color="text" variant="body2">
                                {userDetails.boat.name}
                              </VuiTypography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={<VuiTypography color="white" variant="body1">Boat Type</VuiTypography>}
                            secondary={
                              <VuiTypography color="text" variant="body2">
                                {userDetails.boat.boatType}
                              </VuiTypography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={<VuiTypography color="white" variant="body1">Capacity</VuiTypography>}
                            secondary={
                              <VuiTypography color="text" variant="body2">
                                {userDetails.boat.boatCapacity} passengers
                              </VuiTypography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={<VuiTypography color="white" variant="body1">License</VuiTypography>}
                            secondary={
                              userDetails.boat.boatLicense ? (
                                <VuiButton
                                  variant="gradient"
                                  color="info"
                                  size="small"
                                  onClick={() => handleDownloadLicense(userDetails.boat._id)}
                                >
                                  Download License
                                </VuiButton>
                              ) : (
                                <VuiTypography color="text" variant="body2">
                                  Not provided
                                </VuiTypography>
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={<VuiTypography color="white" variant="body1">Amenities</VuiTypography>}
                            secondary={
                              <VuiBox display="flex" flexWrap="wrap" gap={1}>
                                {userDetails.boat.amenities.length > 0 ? (
                                  userDetails.boat.amenities.map((amenity, index) => (
                                    <Chip
                                      key={index}
                                      label={amenity}
                                      color="info"
                                      size="small"
                                      sx={{ color: "#fff" }}
                                    />
                                  ))
                                ) : (
                                  <VuiTypography color="text" variant="body2">
                                    None
                                  </VuiTypography>
                                )}
                              </VuiBox>
                            }
                          />
                        </ListItem>
                        {userDetails.boat.photos && userDetails.boat.photos.length > 0 && (
                          <ListItem>
                            <ListItemText
                              primary={<VuiTypography color="white" variant="body1">Photos</VuiTypography>}
                              secondary={
                                <VuiBox display="flex" gap={1} flexWrap="wrap">
                                  {userDetails.boat.photos
                                    .filter(photo => photo && photo.startsWith('/Uploads/boats/')) // Filter valid paths
                                    .map((photo, index) => (
                                      <img
                                        key={index}
                                        src={`${API_BASE_URL}${photo}`}
                                        alt={`Boat photo ${index + 1}`}
                                        style={{
                                          width: 100,
                                          height: 100,
                                          objectFit: "cover",
                                          borderRadius: 8,
                                        }}
                                        onError={(e) => {
                                          e.target.src = "/default-boat.jpg"; // Fallback image
                                        }}
                                      />
                                    ))}
                                  {userDetails.boat.photos.length === 0 && (
                                    <VuiTypography color="text" variant="body2">
                                      No photos available
                                    </VuiTypography>
                                  )}
                                </VuiBox>
                              }
                            />
                          </ListItem>
                        )}
                      </List>
                    </VuiBox>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </Card>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default BoatOwnerDetail;