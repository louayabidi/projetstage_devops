import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaCalendar, FaUsers, FaHome, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import MapComponent from '../Map/MapComponent';

const ReservationPage = () => {
  const { boatId } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userLocation, setUserLocation] = useState([0, 0]); // [lng, lat]

  const [formData, setFormData] = useState({
    numberOfPersons: 1,
    hasKids: false,
    paymentMethod: 'credit_card',
    departureLocation: {
      type: 'Point',
      coordinates: [0, 0], // [lng, lat]
    },
    destination: '',
    numberOfCabins: 1,
    startDate: '',
    endDate: '',
  });

  // Use watchPosition for real-time location updates
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setFormData((prev) => ({
            ...prev,
            departureLocation: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          }));
        },
        (err) => {
          setError('Failed to get current location. Please enter coordinates manually.');
          console.error('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/boats/${boatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoat(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [boatId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'hasKids') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'departureLat' || name === 'departureLng') {
      setFormData((prev) => ({
        ...prev,
        departureLocation: {
          ...prev.departureLocation,
          coordinates:
            name === 'departureLat'
              ? [prev.departureLocation.coordinates[0], parseFloat(value) || 0]
              : [parseFloat(value) || 0, prev.departureLocation.coordinates[1]],
        },
      }));
      setUserLocation(
        name === 'departureLat'
          ? [formData.departureLocation.coordinates[0], parseFloat(value) || 0]
          : [parseFloat(value) || 0, formData.departureLocation.coordinates[1]]
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value,
      }));
    }
  };

  const handleMapLocationChange = (newCoordinates) => {
    setFormData((prev) => ({
      ...prev,
      departureLocation: {
        type: 'Point',
        coordinates: newCoordinates,
      },
    }));
    setUserLocation(newCoordinates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/bookings',
        { ...formData, boatId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Start sending location updates after booking creation
        const intervalId = setInterval(async () => {
          try {
            await axios.put(
              `/api/bookings/${response.data.booking._id}/location`,
              {
                currentLocation: {
                  type: 'Point',
                  coordinates: userLocation,
                },
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        }, 30000); // Update every 30 seconds

        setTimeout(() => {
          navigate(`boats`);
          clearInterval(intervalId); // Stop updates after navigation (optional)
        }, 2000);
      }
    } catch (err) {
      console.error('Booking creation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner animation="border" variant="primary" />
        <h4 className="ml-3 mt-3">Loading reservation details...</h4>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="container mx-auto my-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error</strong>
          <p>Boat not found</p>
          <button
            className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/boats')}
          >
            Back to Boats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-10 px-4">
      <button
        className="mb-4 inline-flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition"
        onClick={() => navigate(`/boats/${boatId}`)}
      >
        ← Back to Boat Details
      </button>

      <div className="flex flex-wrap -mx-4">
        <div className="w-full lg:w-2/3 px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-xl font-semibold">Reservation Request</h3>
            </div>
            <div className="p-6">
              {success ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Reservation Request Sent!</strong>
                  <p>Your reservation request has been sent to the boat owner. You will be redirected to your booking page shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <FaUsers className="inline mr-2" />
                        Number of Persons *
                      </label>
                      <input
                        type="number"
                        name="numberOfPersons"
                        value={formData.numberOfPersons}
                        onChange={handleInputChange}
                        min="1"
                        max={boat.boatCapacity}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-gray-500 text-sm mt-1">Maximum capacity: {boat.boatCapacity} persons</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <FaHome className="inline mr-2" />
                        Number of Cabins *
                      </label>
                      <input
                        type="number"
                        name="numberOfCabins"
                        value={formData.numberOfCabins}
                        onChange={handleInputChange}
                        min="1"
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="hasKids"
                        checked={formData.hasKids}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Includes children under 12 years</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <FaCalendar className="inline mr-2" />
                        Start Date *
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <FaCalendar className="inline mr-2" />
                        End Date *
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      <FaMapMarkerAlt className="inline mr-2" />
                      Departure Location *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        name="departureLat"
                        value={formData.departureLocation.coordinates[1]}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        name="departureLng"
                        value={formData.departureLocation.coordinates[0]}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <MapComponent
                      initialPosition={userLocation}
                      onLocationChange={handleMapLocationChange}
                    />
                    <p className="text-gray-500 text-sm mt-2 italic">
                      Real-time location tracking enabled. Your position will update automatically as you move. You can also click on the map to set a custom location.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Destination *
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="Enter your destination"
                      required
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      <FaMoneyBillWave className="inline mr-2" />
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
                        submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-3 inline-block"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                            />
                          </svg>
                          Sending Request...
                        </>
                      ) : (
                        'Send Reservation Request'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 px-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-5">
            <div className="bg-gray-100 p-4">
              <h5 className="text-lg font-semibold">Boat Summary</h5>
            </div>
            <div className="p-6">
              <h6 className="text-lg font-medium">{boat.name}</h6>
              <p className="text-gray-500">{boat.boatType}</p>

              {boat.photos && boat.photos.length > 0 && (
                <img
                  src={`http://localhost:3000${boat.photos[0]}`}
                  alt={boat.name}
                  className="w-full rounded mb-4"
                />
              )}

              <div className="mb-2">
                <strong>Capacity:</strong> {boat.boatCapacity} persons
              </div>
              <div className="mb-2">
                <strong>License:</strong> {boat.boatLicense}
              </div>

              {boat.amenities && boat.amenities.length > 0 && (
                <div className="mt-3">
                  <strong>Amenities:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {boat.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {boat.amenities.length > 3 && (
                      <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded">
                        +{boat.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;