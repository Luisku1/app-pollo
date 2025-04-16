import { useEffect, useMemo, useState } from "react"
import { getProvidersInputs } from "../../services/ProvidersInputs/getProvidersInputs"
import { useCreateProviderInput } from "./useCreateProviderInput"
import { useDeleteProviderInput } from "./useDeleteProviderInput"
import { set, Types } from "mongoose"

export const useProviderInputs = ({ companyId = null, productId = null, date = null, initialInputs = null }) => {

  const [providerInputs, setProviderInputs] = useState([])
  const { createProviderInput } = useCreateProviderInput()
  const { deleteProviderInput } = useDeleteProviderInput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const spliceProviderInput = ({ productIndex = null, inputIndex = null, inputId = null }) => {
    setProviderInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];

      if (!isNaN(productIndex) && productIndex >= 0) {
        const productData = updatedInputs[productIndex];
        let removedInput = null;

        if (!isNaN(inputIndex) && !inputIndex < 0) {
          // Remove input by index
          removedInput = productData.inputs.splice(inputIndex, 1)[0];
        } else if (inputId) {
          // Remove input by ID
          const inputToRemoveIndex = productData.inputs.findIndex((input) => input._id === inputId);
          if (inputToRemoveIndex !== -1) {
            removedInput = productData.inputs.splice(inputToRemoveIndex, 1)[0];
          }
        }

        if (removedInput) {
          // Subtract removed input values from totals
          productData.amount -= removedInput.amount;
          productData.weight -= removedInput.weight;
          productData.pieces -= removedInput.pieces;
          productData.price -= removedInput.price;
          productData.avgPrice =
            productData.amount > 0 ? productData.price / productData.inputs.length : 0;
        }

        return updatedInputs;
      }

      return updatedInputs.filter((_, index) => index !== inputIndex);
    });
  }

  const pushProviderInput = (providerInput) => {
    const { amount, weight, pieces, price, product } = providerInput;
    const productId = product?._id ?? product;

    setProviderInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      let productIndex = updatedInputs.findIndex((input) => input._id === productId)

      if (productIndex !== -1) {
        // Update existing product
        const productData = updatedInputs[productIndex];
        productData.inputs.push(providerInput);
        productData.amount += amount;
        productData.weight += weight;
        productData.pieces += pieces;
        productData.price += price;
        productData.avgPrice =
          productData.amount > 0
            ? productData.price / productData.inputs.length
            : 0;
      } else {
        // Add new product
        updatedInputs.push({
          _id: productId,
          amount,
          weight,
          pieces,
          price,
          avgPrice: amount > 0 ? price : 0,
          inputs: [providerInput],
        });
      }

      return updatedInputs;
    });
  }

  const onAddProviderInput = async (providerInput, group) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempProviderInput = { ...providerInput, _id: tempId }
      pushProviderInput(tempProviderInput)
      await createProviderInput(tempProviderInput, group)

    } catch (error) {

      spliceProviderInput({ productIndex: providerInputs.findIndex((productData) => productData._id === providerInput.product?._id ?? providerInput.product), inputId: tempId })
      console.log(error)
    }
  }

  const onDeleteProviderInput = async (providerInput) => {

    try {

      spliceProviderInput({ productIndex: providerInputs.findIndex((productData) => productData._id === providerInput.product?._id ?? providerInput.product), inputId: providerInput._id })
      await deleteProviderInput(providerInput)

    } catch (error) {

      pushProviderInput(providerInput)
      console.log(error)
    }
  }

  const initialize = (initialArray) => {
    setProviderInputs(initialArray);
  };

  useEffect(() => {

    if (!initialInputs) return

    initialize(initialInputs)

  }, [initialInputs])

  useEffect(() => {

    if (!companyId || !date || !productId) return

    setLoading(true)

    getProvidersInputs({ companyId, productId, date }).then((response) => {

      setProviderInputs(response.providerInputs)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date, productId])

  const sortedProviderInputs = useMemo(() => {
    if (!providerInputs) return []
    if (providerInputs.length === 0) return []

    const sortedProducts = providerInputs.sort((a, b) => { b.amount - a.amount })

    return sortedProducts.map((productInput) => {
      const inputs = productInput.inputs
      let clientsInputs = inputs.filter((input) => !input.branch)
      clientsInputs = clientsInputs.sort((a, b) => a.name - b.name)
      let branchesInputs = inputs
        .filter((input) => input.branch)
        .sort((a, b) => a.branch.position - b.branch.position)

      return {
        ...productInput, inputs: [...branchesInputs, ...clientsInputs]
      }
    })
  }, [providerInputs])

  const finalInputs = useMemo(() => {
    return sortedProviderInputs.map((productInput) => {

      const { amount, weight, pieces, price } = productInput.inputs.reduce((acc, input) => {
        return {
          amount: acc.amount + input.amount,
          weight: acc.weight + input.weight,
          pieces: acc.pieces + input.pieces,
          price: acc.price + input.price
        }
      }
        , { amount: 0, weight: 0, pieces: 0, price: 0 })

      return {
        ...productInput,
        amount,
        weight,
        pieces,
        price,
        avgPrice: amount > 0 ? price / productInput.inputs.length : 0, // Calcular el precio promedio
      };
    });
  }, [sortedProviderInputs]);

  const providerInputsAmount = useMemo(() => {
    return finalInputs.reduce((acc, input) => acc + input.amount, 0)
  }, [finalInputs])

  const providerInputsWeight = useMemo(() => {
    return finalInputs.reduce((acc, input) => acc + input.weight, 0)
  }, [finalInputs])

  const providerInputsPieces = useMemo(() => {
    return finalInputs.reduce((acc, input) => acc + input.pieces, 0)
  }, [finalInputs])

  return {
    providerInputs: finalInputs,
    providerInputsAmount,
    providerInputsWeight,
    providerInputsPieces,
    onAddProviderInput,
    onDeleteProviderInput,
    pushProviderInput,
    spliceProviderInput,
    loading,
    error,
    initialize
  }
}