import { useState, useEffect } from "react";
import { getEmployeePaymentFetch } from "../../services/employees/getEmployeePayment";
import { ToastDanger } from "../../helpers/toastify";

export const useEmployeePayment = (incomeId) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);
      try {
        const response = await getEmployeePaymentFetch(incomeId);
        setPayment(response);
      } catch (err) {
        setError(err);
        ToastDanger("Hay un problema con el pago del empleado");
      } finally {
        setError(null)
        setLoading(false);
      }
    };

    if (incomeId) {
      fetchPayment();
    }
  }, [incomeId]);

  return { payment, loading, error };
};
