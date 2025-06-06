import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LeaseReturnUpload from '../pages/Driver/LeaseReturnUpload'; // adjust path if needed

const PrefilledLeaseReturnWrapper = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/delivery/${id}`, {
          credentials: 'include',
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

  return <LeaseReturnUpload prefill={delivery} fromDelivery={true} />;
};

export default PrefilledLeaseReturnWrapper;
