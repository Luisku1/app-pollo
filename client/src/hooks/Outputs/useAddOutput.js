import { useState } from "react"
import { addOutputFetch } from "../../services/Outputs/addOutput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useAddOutput = () => {
  const [loading, setLoading] = useState(false);

  const addOutput = async (output, group) => {

    setLoading(true);
    ToastSuccess(`Se guardó la salida de ${output.product.label}`);

    try {
      await addOutputFetch({
        output: {
          ...output,
          product: output.product._id,
          employee: output.employee._id,
          branch: output.branch?.value || null,
          customer: output.customer?.value || null,
        },
        group
      });


    } catch (error) {
      console.error(error);
      ToastDanger(`No se guardó la salida de ${output.product.label}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { addOutput, loading };
};