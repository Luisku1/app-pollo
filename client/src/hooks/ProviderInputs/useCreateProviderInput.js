import { useState } from "react"
import { createProviderInputFetch } from "../../services/ProvidersInputs/createProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useCreateProviderInput = () => {

  const [loading, setLoading] = useState(false)

  const createProviderInput = async (providerInput, group) => {
    setLoading(true)
    try {
      ToastSuccess(`Se creó la entrada de ${providerInput.product.name ?? providerInput.product.label}`)

      await createProviderInputFetch(
        {
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
        },
        group
      )
    } catch (error) {
      console.log(error)
      ToastDanger(`No se creó la entrada de ${providerInput.product.name ?? providerInput.product.label}`)
    } finally {
      setLoading(false)
    }
  }

  return { createProviderInput, loading }
}

