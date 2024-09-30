import { useState } from "react"
import { addInputFetch } from "../../services/Inputs/addInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useAddInput = () => {

  const [loading, setLoading] = useState(false)

  const addInput = ({ input, group, pushInput, spliceInput, updateInputId }) => {

    setLoading(true)

    pushInput({ input })

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
        branchCustomer: input.branchCustomer.value,
        createdAt: input.createdAt

      }, group
    }).then((response) => {

      updateInputId({ inputId: response._id })
      ToastSuccess(`Se guardó la salida de ${input.product.label}`)

    }).catch((error) => {

      spliceInput({ index: 0 })
      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return { addInput, loading }
}