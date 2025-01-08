import { useState } from "react";
import { deleteExtraOutgoingFetch } from "../../services/ExtraOutgoings/deleteExtraOutgoing";
import { ToastDanger, ToastSuccess } from "../../helpers/toastify";
import { stringToCurrency } from "../../helpers/Functions";

export const useDeleteExtraOutgoing = () => {
  const [loading, setLoading] = useState(false);

  const deleteExtraOutgoing = async (extraOutgoing) => {
    setLoading(true);

    try {
      ToastSuccess(`Se borró el gasto fuera de cuentas de ${stringToCurrency({ amount: extraOutgoing.amount })}`);

      await deleteExtraOutgoingFetch({ extraOutgoingId: extraOutgoing._id });
    } catch (error) {
      console.error(error);
      ToastDanger(`No se borró el gasto fuera de cuentas de ${stringToCurrency({ amount: extraOutgoing.amount })}`);
    } finally {
      setLoading(false);
    }
  };

  return { deleteExtraOutgoing, loading };
};