import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query';
import { deleteOutputFetch } from "../../services/Outputs/deleteOutput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteOutput = () => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient();

  const deleteOutput = async (output) => {
    setLoading(true)
    ToastSuccess(`Se borró la salida de ${output.product?.name ?? output.product?.label}`)
    try {
      await deleteOutputFetch(output._id)
      // Invalida la query de netDifference para que se actualice
      queryClient.invalidateQueries({ queryKey: ['netDifference'] });
    } catch (error) {
      ToastDanger(`No se borró la salida de ${output.product?.name ?? output.product?.label}`)
      console.log(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { deleteOutput, loading }
}