import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function BoatOwnerDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/auth/users/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
        setBoat(res.data.boat);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      {boat ? (
        <>
          <h2>Boat Info</h2>
          <p>Name: {boat.name}</p>
          <p>Type: {boat.boatType}</p>
          <p>Capacity: {boat.boatCapacity}</p>
          {/* Affiche plus d’infos / images du bateau */}
          {boat.photos && boat.photos.map((photo, i) => (
            <img key={i} src={`http://localhost:3000${photo}`} alt={`Boat photo ${i+1}`} width={200} />
          ))}
        </>
      ) : (
        <p>No boat info available</p>
      )}
    </div>
  );
}

export default BoatOwnerDetail;
