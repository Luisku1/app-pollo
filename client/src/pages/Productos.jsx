import { useEffect, useState } from "react"
import { FaTrash } from "react-icons/fa"
import { useSelector } from "react-redux"

export default function Productos() {

  const { company } = useSelector((state) => state.user)
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productFormData, setProductFormData] = useState({})
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)

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

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold my-7'>

        Productos

      </h1>

      {error ? <p>{error}</p> : ''}

      <form id='productForm' onSubmit={addProduct} className="bg-white shadow-md grid grid-cols-1 items-center justify-between rounded-lg gap-2">

        <input type="text" name="name" id="name" placeholder='Nombre del producto' className='border border-black p-3 rounded-lg' required onInput={productButtonControl} onChange={handleProductInputsChange} />
        <input type="number" name="price" id="price" placeholder="Precio inicial" className="border border-black p-3 rounded-lg" onChange={handleProductInputsChange} />
        <button type='submit' id='product-button' disabled={loading} className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

      </form>

      <div className="grid my-4 grid-cols-2" id="list-element">
        {products && products.length > 0 && products.map((product, index) => (

          <div className="m-1 p-3 bg-white text-center shadow-lg grid grid-cols-5 rounded-lg" key={product._id}>

            <p className="col-span-3 text-center font-sans text-lg font-semibold ">
              {product.name}
            </p>

            <div>
                <button id={product._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(product._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && product._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProduct(product._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

          </div>

        ))}
      </div>

    </main>
  )
}
