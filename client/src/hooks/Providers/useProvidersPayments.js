import { useEffect, useState, useMemo } from "react";

export const useProvidersPayments = ({ companyId = null, date = null }) => {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Solicitud de Todos los Movimientos hechos a los Proveedores
/*  useEffect(() => {
    if (!companyId) return;
    const fetchPayments = async () => {
      try {
        const res = await fetch(
          "/api/provider/get-providers-payments/" + companyId + "/" + date
        );
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }
        setPayments(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    setPayments([]);
    fetchPayments();
  }, [companyId, date]);
*/
  const newPayment = async (paymentData) => {
    try {
      const res = await fetch("/api/provider/new-payment-providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentData,
          employee: paymentData?.employee?._id,
          provider: paymentData?.provider?._id,
          company: paymentData?.company?._id,
        }),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(true);
        return;
      }

      setPayments((prevPayments) => [paymentData, ...prevPayments]);
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
      setError(error.message);
    }
  };

  const onDeletePayment = async (paymentId) => {
    try {
      const res = await fetch(
        "/api/provider/delete-payment-providers/" + paymentId,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setPayments((prevPayments) =>
        prevPayments.filter((payment) => payment._id !== paymentId)
      );

      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

/*  const { totalAmountCash, totalAmount } = useMemo(() => {
    const totalAmountCash = payments.reduce(
      (acc, payments) => acc + payments.amountCash,
      0
    );
    const totalAmount = payments.reduce(
      (acc, payments) => acc + payments.amount,
      0
    );

    return { totalAmountCash, totalAmount };
  }, [payments]);
*/
  console.log(payments);
  return {
    payments,
    loading,
    error,
    newPayment,
    onDeletePayment,
  };
};
