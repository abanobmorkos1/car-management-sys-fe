// PrefilledCODWrapper.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewCOD from '../pages/Driver/CODUpload'; // Adjust path if needed

const PrefilledCODWrapper = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/delivery/${id}`, {
          credentials: 'include'
        });
        const data = await res.json();
        setDelivery(data);
      } catch (err) {
        console.error('❌ Failed to fetch delivery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!delivery) return <p>No delivery found.</p>;

  return <NewCOD prefill={delivery} fromDelivery={true} />;
};

export default PrefilledCODWrapper;
