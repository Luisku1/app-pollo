import { useState } from "react"
import { useQueryClient } from '@tanstack/react-query';
import { deleteInputFetch } from "../../services/Inputs/deleteInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteInput = () => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient();

  const deleteInput = async (input) => {
    setLoading(true)
    try {
      ToastSuccess(`Se borró la entrada de ${input.product?.name ?? input.product?.label}`)
      await deleteInputFetch(input._id)
      // Invalida la query de netDifference para que se actualice
      queryClient.invalidateQueries({ queryKey: ['netDifference'] });
    } catch (error) {
      ToastDanger(`No se encontró la entrada de ${input.product?.name || input.product?.label}`)
      console.log(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { deleteInput, loading }
}