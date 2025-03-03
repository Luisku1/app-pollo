import { useState } from "react"
import { addExtraOutgoingFetch } from "../../services/ExtraOutgoings/addExtraOutgoing"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { currency } from "../../helpers/Functions"

export const useAddExtraOutgoing = () => {
  const [loading, setLoading] = useState(false);

  const addExtraOutgoing = async (extraOutgoing) => {
    setLoading(true);

    try {
      ToastSuccess(`Se registró el gasto de ${currency({ amount: extraOutgoing.amount })}`);

      await addExtraOutgoingFetch(
        {
          _id: extraOutgoing._id || null,
          amount: extraOutgoing.amount,
          concept: extraOutgoing.concept,
          employee: extraOutgoing.employee._id,
          company: extraOutgoing.company,
          createdAt: extraOutgoing.createdAt,
        },
      );

    } catch (error) {
      ToastDanger(`No se registró el gasto de ${currency({ amount: extraOutgoing.amount })}`);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { addExtraOutgoing, loading };
};