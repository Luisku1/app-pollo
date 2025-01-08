import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { getProvidersPurchases } from "../../services/Providers/getProvidersPurchases"
import useAddProviderPurchase from "./useAddProviderPurchase"
import { useDeleteProviderPurchase } from "./useDeleteProviderPurchase"

const useProvidersPurchases = ({ companyId, date = null, initialPurchases = [] }) => {
  const [purchases, setPurchases] = useState(initialPurchases)
  const [totalAmount, setTotalAmount] = useState(
    initialPurchases.reduce((acc, purchase) => acc + purchase.amount, 0)
  )
  const { deleteProviderPurchase } = useDeleteProviderPurchase()
  const { addPurchase } = useAddProviderPurchase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushPurchase = (purchase) => {
    setPurchases((prevPurchases) => [purchase, ...prevPurchases])
    setTotalAmount((prevTotal) => prevTotal + purchase.amount)
  }

  const splicePurchase = (index) => {
    const removedPurchase = purchases.splice(index, 1)
    setTotalAmount((prevTotal) => prevTotal - removedPurchase[0].amount)
  }

  const updateLastPurchaseId = ({ purchaseId }) => {
    setPurchases((prevPurchases) => prevPurchases.map((purchase, index) =>
      index === 0 ? { _id: purchaseId, ...purchase } : purchase
    ))
  }

  const onAddPurchase = async (purchase) => {
    const tempId = uuidv4()

    try {
      pushPurchase(purchase)
      await addPurchase(purchase)
    } catch (error) {
      splicePurchase(purchases.findIndex((purchase) => purchase._id === tempId))
      console.log(error)
    }
  }

  const onDeletePurchase = async (purchase, index) => {
    try {
      splicePurchase(index)
      await deleteProviderPurchase(purchase)
    } catch (error) {
      pushPurchase(purchase)
      console.log(error)
    }
  }

  const sortedPurchases = useMemo(() => {

    return purchases.sort((a, b) => {
      return b.amount - a.amount
    })

  }, [purchases])

  useEffect(() => {
    if (!companyId || !date) return;

    const fetchProviderPurchases = async () => {
      setLoading(true);
      setPurchases([]);
      setTotalAmount(0.0);

      try {
        const response = await getProvidersPurchases({ companyId, date });
        setPurchases(response.purchases);
        setTotalAmount(response.totalAmount);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderPurchases();
  }, [companyId, date]);

  return {
    purchases: sortedPurchases,
    totalAmount,
    onAddPurchase,
    onDeletePurchase,
    loading,
    pushPurchase,
    splicePurchase,
    updateLastPurchaseId,
    error
  }
}

export default useProvidersPurchases
