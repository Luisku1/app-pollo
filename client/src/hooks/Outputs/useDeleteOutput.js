import { useState } from "react"
import { deleteOutputFetch } from "../../services/Outputs/deleteOutput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteOutput = () => {

  const [loading, setLoading] = useState(false)

  const deleteOutput = ({ output, spliceOutput, index }) => {

    setLoading(true)

    spliceOutput({ index })
    ToastSuccess(`Se borró la salida de ${output.product?.name ?? output.product?.label}`)

    deleteOutputFetch({ outputId: output._id }).then(() => {


    }).catch((error) => {

      ToastDanger(`No se borró la salida de ${output.product?.name ?? output.product?.label}`)
      console.log(error)
    })

    setLoading(false)
  }

  return { deleteOutput, loading }
}