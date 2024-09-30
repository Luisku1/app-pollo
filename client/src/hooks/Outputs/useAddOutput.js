import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addOutputFetch } from "../../services/Outputs/addOutput"

export const useAddOutput = () => {

  const [loading, setLoading] = useState(false)

  const addOutput = ({ output, group, pushOutput, spliceOutput, updateOutputId }) => {

    setLoading(true)

    pushOutput({ output })

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
        branchCustomer: output.branchCustomer.value,
        createdAt: output.createdAt
      }, group
    }).then((response) => {

      updateOutputId({ outputId: response._id })
      ToastSuccess(`Se guardó la salida de ${output.product.label}`)

    }).catch((error) => {

      spliceOutput({ index: 0 })
      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return { addOutput, loading }
}