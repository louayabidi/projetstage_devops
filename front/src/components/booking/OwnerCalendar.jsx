import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Tooltip } from '@mui/material';
import WeatherWidget from './WeatherWidget';

const localizer = momentLocalizer(moment);

const OwnerCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState('departure');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('/api/bookings/owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings = response.data.bookings || [];

        const calendarEvents = bookings.map((booking) => ({
          id: booking._id,
          title: `⛵ ${booking.status.toUpperCase()}: ${booking.numberOfPersons} persons on ${booking.boat.name}`,
          start: new Date(booking.startDate),
          end: new Date(booking.endDate),
          allDay: false,
          resource: booking,
          color: getEventColor(booking.status),
        }));

        setEvents(calendarEvents);
        if (bookings.length > 0) {
          setSelectedBooking(bookings[0]);
        }
      } catch (err) {
        console.error('Fetch bookings error:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getEventColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#34d399'; // Emerald green
      case 'offered':
        return '#f59e0b'; // Amber
      case 'pending':
        return '#3b82f6'; // Blue
      case 'canceled':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      padding: '4px 8px',
      fontSize: '0.875rem', // Smaller font for mobile
      transition: 'transform 0.2s ease-in-out',
      cursor: 'pointer',
    },
  });

  const filteredEvents = filter === 'all' ? events : events.filter((event) => event.resource.status === filter);

  const handleBookingSelect = (e) => {
    const bookingId = e.target.value;
    const booking = events.find((event) => event.id === bookingId)?.resource;
    setSelectedBooking(booking);
  };

  const getWeatherCoordinates = () => {
    if (!selectedBooking) return null;
    return weatherLocation === 'departure'
      ? selectedBooking.departureLocation?.coordinates
      : selectedBooking.destination?.coordinates || selectedBooking.departureLocation?.coordinates;
  };

  const getWeatherLocationName = () => {
    if (!selectedBooking) return 'No Location';
    return weatherLocation === 'departure' ? 'Departure Location' : selectedBooking.destination || 'Destination';
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="card">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 sm:p-6 rounded-t-lg">
          <h2 className="text-2xl sm:text-3xl font-bold">⛵ My Boat Bookings Calendar</h2>
          <p className="mt-2 text-base sm:text-lg">Manage your boat bookings with ease!</p>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <select
              className="p-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={selectedBooking?._id || ''}
              onChange={handleBookingSelect}
            >
              <option value="" disabled>
                Select a booking
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.resource.boat.name} - {event.resource.status.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={weatherLocation}
              onChange={(e) => setWeatherLocation(e.target.value)}
            >
              <option value="departure">Departure Location</option>
              <option value="destination">Destination</option>
            </select>
          </div>
          {selectedBooking && (
            <div className="mt-4">
              <WeatherWidget coordinates={getWeatherCoordinates()} locationName={getWeatherLocationName()} />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-b-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <span className="flex items-center text-sm sm:text-base">
                <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400 mr-2"></span>Confirmed
              </span>
              <span className="flex items-center text-sm sm:text-base">
                <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 mr-2"></span>Offered
              </span>
              <span className="flex items-center text-sm sm:text-base">
                <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mr-2"></span>Pending
              </span>
              <span className="flex items-center text-sm sm:text-base">
                <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 mr-2"></span>Canceled
              </span>
            </div>
            <select
              className="p-2 border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="offered">Offered</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-auto">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ minHeight: '400px', maxWidth: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => {
                window.location.href = `/bookings/${event.id}`;
              }}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              components={{
                event: ({ event }) => (
                  <Tooltip
                    title={
                      <div>
                        <strong>Boat:</strong> {event.resource.boat.name}
                        <br />
                        <strong>Passenger:</strong> {event.resource.passenger.firstName}{' '}
                        {event.resource.passenger.lastName}
                        <br />
                        <strong>Persons:</strong> {event.resource.numberOfPersons}
                        <br />
                        <strong>Status:</strong> {event.resource.status.toUpperCase()}
                        <br />
                        <strong>From:</strong> {moment(event.start).format('MMM D, YYYY h:mm A')}
                        <br />
                        <strong>To:</strong> {moment(event.end).format('MMM D, YYYY h:mm A')}
                      </div>
                    }
                    placement="top"
                  >
                    <div className="text-xs sm:text-sm">{event.title}</div>
                  </Tooltip>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerCalendar;