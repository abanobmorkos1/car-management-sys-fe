import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewCOD from '../Driver/CODUpload'; // ✅ adjust this path based on your project

const api = process.env.REACT_APP_API_URL;

const CodFromDelivery = () => {
  const { id: deliveryId } = useParams();
  const [prefillData, setPrefillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchCOD = async () => {
    try {
      const res = await fetch(`${api}/cod/by-delivery/${deliveryId}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setPrefillData({
          ...data,
          delivery: data.delivery?._id || data.delivery || deliveryId, // ✅ ensure ID is passed
          salesperson: data.salesperson?._id || data.salesperson || '',
          driver: data.driver?._id || data.driver || '',
        });
      } else {
        console.error('❌ COD not found:', data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching COD:', err);
    } finally {
      setLoading(false);
    }
  };

  if (deliveryId) fetchCOD();
}, [deliveryId]);

  if (loading) return <p>Loading COD...</p>;
  if (!prefillData) return <p>COD not found for this delivery.</p>;

  return <NewCOD prefill={prefillData} fromDelivery={true} />;
};

export default CodFromDelivery;
