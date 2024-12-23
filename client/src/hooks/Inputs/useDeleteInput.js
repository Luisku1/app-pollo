import { useState } from "react"
import { deleteInputFetch } from "../../services/Inputs/deleteInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteInput = () => {

  const [loading, setLoading] = useState(false)

  const deleteInput = (input, index, spliceInput) => {

    setLoading(true)

    spliceInput({ index })
    ToastSuccess(`Se borró la entrada de ${input.product?.name ?? input.product?.label}`)

    deleteInputFetch({ inputId: input._id }).catch((error) => {

      ToastDanger(`No se encontró la entrada de ${input.product?.name || input.product?.label}`)
      console.log(error)
    })

    setLoading(false)
  }

  return { deleteInput, loading }
}