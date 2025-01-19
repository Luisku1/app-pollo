import { useState } from 'react';

const useChangePrices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePrices = async (branchId, date, pricesDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/product/price/change-prices/' + branchId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, pricesDate }),
      });

      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.message);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { changePrices, loading, error };
};

export default useChangePrices;
