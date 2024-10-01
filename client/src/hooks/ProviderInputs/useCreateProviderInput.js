import { useState } from "react"
import { createProviderInputFetch } from "../../services/ProvidersInputs/createProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useCreateProviderInput = () => {

  const [loading, setLoading] = useState(false)

  const createProviderInput = ({ providerInput, group, pushProviderInput, spliceProviderInput, updateLastProviderInputId }) => {

    setLoading(true)

    pushProviderInput({ providerInput })
    ToastSuccess(`Se creó la entrada de ${providerInput.product.label}`)

    createProviderInputFetch({
      providerInput: {
        price: providerInput.price,
        amount: providerInput.amount,
        comment: providerInput.comment,
        weight: providerInput.weight,
        pieces: providerInput.pieces,
        specialPrice: providerInput.specialPrice,
        company: providerInput.company,
        product: providerInput.product.value,
        employee: providerInput.employee._id,
        branch: providerInput.branch?.value || null,
        customer: providerInput.customer?.value || null,
        createdAt: providerInput.createdAt
      }, group
    }).then((response) => {

      updateLastProviderInputId({providerInputId: response._id})

    }).catch((error) => {

      spliceProviderInput(0)
      console.log(error)
      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return { createProviderInput, loading }
}

