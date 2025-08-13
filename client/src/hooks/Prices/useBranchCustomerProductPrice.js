import { useEffect, useState } from "react"
import { getBranchCustomerProductPrice } from "../../services/Prices/getBranchCustomerProductPrice"
import { ToastInfo } from "../../helpers/toastify"

export const useBranchCustomerProductPrice = ({ branchCustomerId, productId, date, group }) => {

  const [price, setPrice] = useState(0.0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (!branchCustomerId || !productId || !date || !group) {
      setPrice(0.0)
      return
    }

    setLoading(true)

    setPrice(0.0)

    getBranchCustomerProductPrice({ branchCustomerId, productId, date, group }).then((price) => {

      setPrice(price)

    }).catch((error) => {

      ToastInfo('No se encontró ningún precio para ese producto en esa sucursal')
      console.log(error)
    })

    setLoading(false)

  }, [branchCustomerId, productId, date, group])

  return { price, loading }
}