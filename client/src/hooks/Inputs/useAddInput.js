import { useState } from "react"
import { addInputFetch } from "../../services/Inputs/addInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useAddInput = () => {

  const [loading, setLoading] = useState(false)

  const addInput = ({ input, group, pushInput, spliceInput, updateLastInputId }) => {

    setLoading(true)

    pushInput({ input })
    ToastSuccess(`Se guardó la entrada de ${input.product.label}`)

    addInputFetch({
      input: {
        price: input.price,
        amount: input.amount,
        comment: input.comment,
        weight: input.weight,
        pieces: input.pieces,
        specialPrice: input.specialPrice,
        company: input.company,
        product: input.product.value,
        employee: input.employee._id,
        branch: input.branch?.value || null,
        customer: input.customer?.value || null,
        createdAt: input.createdAt
      }, group
    }).then((response) => {

      updateLastInputId({ inputId: response._id })

    }).catch((error) => {

      console.log(error)
      spliceInput({ index: 0 })
      ToastDanger(`No se guardó la entrada de ${input.product.label}`)
    })

    setLoading(false)
  }

  return { addInput, loading }
}