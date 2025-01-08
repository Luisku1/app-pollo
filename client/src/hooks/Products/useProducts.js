import { useEffect, useState } from "react"
import { getProductsFetch } from "../../services/Products/getProducts"

export const useProducts = ({ companyId }) => {

  const [products, setProducts] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    getProductsFetch(companyId).then((response) => {

      setProducts(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId])

  return { products, error, loading }
}