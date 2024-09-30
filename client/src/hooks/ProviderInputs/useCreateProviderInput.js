import { useState } from "react"
import { createProviderInputFetch } from "../../services/ProvidersInputs/createProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useCreateProviderInput = () => {

  const [loading, setLoading] = useState(false)

  const createProviderInput = ({ providerInput, pushProviderInput, spliceProviderInput }) => {

    setLoading(true)

    pushProviderInput({ providerInput })

    createProviderInputFetch({ providerInput }).then(() => {

      ToastSuccess('Se creó la entrada de proveedor')

    }).catch((error) => {

      spliceProviderInput(0)
      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return { createProviderInput, loading }
}

