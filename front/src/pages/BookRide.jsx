import { useState } from 'react';
import MaritimeMap from '../components/Map/MaritimeMap';

const BookRide = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);

  return (
    <div className="book-ride">
      <h2>Book a Sea Ride</h2>
      <div className="booking-form">
        <input 
          type="text" 
          placeholder="Enter pickup location"
          onChange={(e) => setPickup(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Enter destination"
          onChange={(e) => setDestination(e.target.value)}
        />
        <button>Search Boats</button>
      </div>
      <MaritimeMap />
    </div>
  );
};

export default BookRide;