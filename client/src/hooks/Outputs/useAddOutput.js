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
          _id: output._id,
          price: output.price,
          amount: output.amount,
          comment: output.comment,
          weight: output.weight,
          pieces: output.pieces,
          specialPrice: output.specialPrice,
          company: output.company,
          product: output.product.value,
          employee: output.employee._id,
          branch: output.branch?.value || null,
          customer: output.customer?.value || null,
          createdAt: output.createdAt
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