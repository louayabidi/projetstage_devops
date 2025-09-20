import React, { useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Paper,
  Avatar,
  InputAdornment,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DirectionsBoatFilledIcon from "@mui/icons-material/DirectionsBoatFilled";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const CompleteBoatInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    boatType: "",
    boatCapacity: "",
    description: "", // New field
    amenities: [],
    photos: [],
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [amenityInput, setAmenityInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityAdd = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
    }
    setAmenityInput("");
  };

  const handleAmenityDelete = (amenityToDelete) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenityToDelete),
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files],
    }));
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...formData.photos];
    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData((prev) => ({ ...prev, photos: newPhotos }));
    setPreviewUrls(newPreviews);
  };

  const handleRemoveLicense = () => {
    if (licensePreview) URL.revokeObjectURL(licensePreview);
    setLicenseFile(null);
    setLicensePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first");
        navigate("/login");
        return;
      }

      if (!licenseFile) {
        alert("Boat license photo is required");
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("boatType", formData.boatType);
      formDataToSend.append("boatCapacity", formData.boatCapacity);
      formDataToSend.append("description", formData.description); // New field
      formDataToSend.append("amenities", JSON.stringify(formData.amenities));
      formData.photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });
      formDataToSend.append("boatLicense", licenseFile);

      const response = await axios.put(
        "/api/boats/complete-info",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Failed to save boat information");
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side validation
  const isFormValid =
    formData.name &&
    formData.boatType &&
    formData.boatCapacity &&
    Number(formData.boatCapacity) >= 1 &&
    formData.description &&
    licenseFile;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Stack alignItems="center" spacing={1} mb={2}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <DirectionsBoatFilledIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" mt={1} color="primary">
            Complete Your Boat Information
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please tell us more about your boat to help travelers make a great choice.
          </Typography>
        </Stack>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Boat Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Boat Type"
              name="boatType"
              value={formData.boatType}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Boat Capacity"
              name="boatCapacity"
              type="number"
              value={formData.boatCapacity}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <Box>
              <Typography variant="subtitle1">Boat License Photo</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload License Photo
                <input
                  type="file"
                  ref={licenseInputRef}
                  onChange={handleLicenseChange}
                  accept="image/*"
                  hidden
                />
              </Button>
              {licensePreview && (
                <Box sx={{ position: "relative", mb: 2 }}>
                  <img
                    src={licensePreview}
                    alt="Boat license preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 4,
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.7)",
                      },
                    }}
                    onClick={handleRemoveLicense}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <TextField
              label="Boat Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
              placeholder="Describe your boat (e.g., features, amenities, ideal uses)"
            />
            <Box>
              <Typography variant="subtitle1">Amenities</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add an amenity (e.g. WiFi)"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAmenityAdd();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={handleAmenityAdd}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ minWidth: "32px" }}
                        >
                          Add
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Stack>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {formData.amenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onDelete={() => handleAmenityDelete(amenity)}
                    color="primary"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle1">Boat Photos</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Photos
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  hidden
                />
              </Button>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {previewUrls.map((url, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Boat preview ${index}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 4,
                        marginBottom: 1,
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.7)",
                        },
                      }}
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              color="primary"
              disabled={isLoading || !isFormValid}
              sx={{ mt: 2 }}
              startIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : null}
            >
              {isLoading ? "Saving..." : "Complete Registration"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CompleteBoatInfo;