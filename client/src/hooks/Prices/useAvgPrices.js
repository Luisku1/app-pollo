import { useEffect, useState } from 'react';
import { getAvgPrices } from '../../services/Prices/getAvgPrices';

export const useAvgPrices = ({ companyId, residuals = false } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    getAvgPrices({ companyId, residuals })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [companyId, residuals]);

  return { data, loading, error };
};
