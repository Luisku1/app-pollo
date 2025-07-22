import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query';
import { addOutputFetch } from "../../services/Outputs/addOutput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useAddOutput = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
      // Invalida la query de netDifference para que se actualice
      queryClient.invalidateQueries({ queryKey: ['netDifference'] });
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