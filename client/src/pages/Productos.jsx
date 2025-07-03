import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DeleteButton from "../components/Buttons/DeleteButton"

export default function Productos() {

  const { company } = useSelector((state) => state.user)
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productFormData, setProductFormData] = useState({ byPieces: true })

  const handleProductInputsChange = (e) => {

    setProductFormData({

      ...productFormData,
      [e.target.id]: e.target.value,

    })

  }

  const productButtonControl = () => {

    const nameInput = document.getElementById('name')
    const button = document.getElementById('product-button')

    if (nameInput.value == '') {

      button.disabled = true

    } else {

      button.disabled = false
    }
  }

  const addProduct = async (e) => {

    const nameInput = document.getElementById('name')
    const priceInput = document.getElementById('price')

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch('/api/product/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productFormData,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      setProducts([...products, data.product])

      nameInput.value = ''
      priceInput.value = ''

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteProduct = async (productId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/product/delete/' + productId, {

        method: 'DELETE'

      })
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }


      products.splice(index, 1)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await fetch('/api/product/get-products/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setProducts(data.products)
        setError(null)

      } catch (error) {

        setError(error.message)
      }
    }
    fetchProducts()
  }, [company._id])

  useEffect(() => {

    document.title = 'Productos'
  })

  return (

    <main className="p-2 md:p-6 max-w-2xl mx-auto mb-32">
      <h1 className="text-3xl md:text-4xl text-center font-bold mt-7 mb-6 text-gray-800">
        Productos
      </h1>
      {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center">{error}</div>}
      <form id="productForm" onSubmit={addProduct} className="bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-3 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            autoCapitalize="on"
            autoComplete="off"
            name="name"
            id="name"
            placeholder="Nombre del producto"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            required
            onInput={productButtonControl}
            onChange={handleProductInputsChange}
          />
          <input
            type="number"
            autoComplete="off"
            name="price"
            id="price"
            placeholder="Precio inicial"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            onChange={handleProductInputsChange}
            min="0"
            required
            step="0.01"
          />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="byPieces"
            name="byPieces"
            checked={!!productFormData.byPieces}
            onChange={e => setProductFormData(prev => ({ ...prev, byPieces: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
          />
          <label htmlFor="byPieces" className="text-sm text-gray-700 select-none cursor-pointer">
            Marca la casilla si el producto se vende por pieza
          </label>
        </div>
        <button
          type="submit"
          id="product-button"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold rounded-xl p-3 uppercase tracking-wide shadow transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Agregando...' : 'Agregar'}
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="list-element">
        {products && products.length > 0 && products.map((product, index) => (
          <div className="flex flex-col bg-white shadow-md border border-gray-200 rounded-xl p-4 gap-2 transition hover:shadow-lg" key={product._id}>
            <div className="flex-1 text-center font-sans text-lg font-semibold text-gray-800 break-words">
              {product.name}
            </div>
            <div className="">
              <DeleteButton
                deleteFunction={() => deleteProduct(product._id, index)}
                className=""
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
