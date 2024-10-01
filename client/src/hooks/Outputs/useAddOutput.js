import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addOutputFetch } from "../../services/Outputs/addOutput"

export const useAddOutput = () => {

  const [loading, setLoading] = useState(false)

  const addOutput = ({ output, group, pushOutput, spliceOutput, updateLastOutputId }) => {

    setLoading(true)

    pushOutput({ output })
    ToastSuccess(`Se guardó la salida de ${output.product.label}`)

    addOutputFetch({
      output: {
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
      }, group
    }).then((response) => {

      updateLastOutputId({ outputId: response._id })

    }).catch((error) => {

      console.log(error)
      spliceOutput({ index: 0 })
      ToastDanger(`Se guardó la salida de ${output.product.label}`)
    })

    setLoading(false)
  }

  return { addOutput, loading }
}