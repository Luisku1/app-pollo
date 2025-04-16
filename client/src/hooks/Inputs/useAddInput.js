import { useState } from "react"
import { addInputFetch } from "../../services/Inputs/addInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useAddInput = () => {

  const [loading, setLoading] = useState(false)

  const addInput = async (input, group) => {

    setLoading(true)

    try {
      ToastSuccess(`Se guardó la entrada de ${input.product.label}`)

      await addInputFetch({
        input: {
          ...input,
          _id: input._id || null,
          product: input.product._id,
          employee: input.employee._id,
          branch: input.branch?.value || null,
          customer: input.customer?.value || null,
        }, group
      })
    } catch (error) {
      console.log(error)
      ToastDanger(`No se guardó la entrada de ${input.product.label}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { addInput, loading }
}