import { useState } from "react"
import { deleteOutputFetch } from "../../services/Outputs/deleteOutput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteOutput = () => {

  const [loading, setLoading] = useState(false)

  const deleteOutput = async (output) => {

    setLoading(true)

    ToastSuccess(`Se borró la salida de ${output.product?.name ?? output.product?.label}`)

    try {
      await deleteOutputFetch(output._id)
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