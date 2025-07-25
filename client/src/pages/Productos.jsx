import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DeleteButton from "../components/Buttons/DeleteButton"
import { MdEdit } from "react-icons/md"
import { CreateUpdateProduct } from "../components/Products/CreateUpdateProduct"
import Modal from "../components/Modals/Modal"
import { useProducts } from "../hooks/Products/useProducts"

export default function Productos() {

  const { company } = useSelector((state) => state.user)
  const { products } = useProducts({ companyId: company._id })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)


  const onEditProduct = (product) => {
    setProductToEdit(product)
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

    document.title = 'Productos'
  })

  return (

    <main className="p-2 md:p-6 max-w-2xl mx-auto mb-32">
      <h1 className="text-3xl md:text-4xl text-center font-bold mt-7 mb-6 text-gray-800">
        Productos
      </h1>
      {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center">{error}</div>}
      <Modal
        closeModal={() => setProductToEdit(null)}
        content={
          <CreateUpdateProduct
            onSubmit={onEditProduct}
            product={productToEdit}
          />
        }
        fit={true}
        width="11/12"
        isShown={!!productToEdit}
      />
      <CreateUpdateProduct onSubmit={addProduct} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="list-element">
        {products && products.length > 0 && products.map((product, index) => (
          <div className="flex flex-col bg-white shadow-md border border-gray-200 rounded-xl p-4 gap-2 transition hover:shadow-lg" key={product._id}>
            <div className="flex-1 text-center font-sans text-lg font-semibold text-gray-800 break-words">
              {product.name}
            </div>
            <div className="flex items-center justify-between">

              <div className="w-10">
                <DeleteButton
                  deleteFunction={() => deleteProduct(product._id, index)}
                  className=""
                />
              </div>
              <div className="w-10 rounded-lg border border-gray-300 p-2 flex items-center justify-center">
                <button className="text-blue-500 hover:text-blue-700 transition" onClick={() => setProductToEdit(product)}>
                  <MdEdit className="text-blue-500 text-2xl cursor-pointer rounded" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
