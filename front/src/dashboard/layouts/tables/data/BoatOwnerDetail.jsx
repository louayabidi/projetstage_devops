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
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function BoatOwnerDetail() {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`/api/users/${id}/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserDetails(response.data.user);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch user details");
      setLoading(false);
      console.error(err);
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
                              <VuiTypography color="text" variant="body2">
                                {userDetails.boat.boatLicense}
                              </VuiTypography>
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
                                  {userDetails.boat.photos.map((photo, index) => (
                                    <img
                                      key={index}
                                      src={photo}
                                      alt={`Boat photo ${index + 1}`}
                                      style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 8,
                                      }}
                                    />
                                  ))}
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