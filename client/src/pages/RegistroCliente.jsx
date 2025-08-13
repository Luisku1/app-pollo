import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ToastSuccess } from "../helpers/toastify"

export default function RegistroCliente() {

  const { company } = useSelector(state => state.user)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.id]: e.target.value

    })
  }

  const handleSubmit = async (e) => {

    const form = document.getElementById('form')

    e.preventDefault()

    try {

      setLoading(true)


      const res = await fetch('api/customer/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            company: company._id
          })
        })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      ToastSuccess('Cliente registrado correctamente')
      form.reset()

      setLoading(false)

    } catch (error) {

      setLoading(false)
      setError(error.message)
    }
  }

  useEffect(() => {

    document.title = 'Registro Cliente'
  })

  return (
    <main>

      <div className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          Registra un nuevo cliente

        </h1>

        <form onSubmit={handleSubmit} id="form" className="flex flex-col gap-4">
          <input type="text" name="name" id="name" placeholder="Nombre del cliente o empresa" className='border p-3 rounded-lg' onChange={handleChange} required />
          <input type="text" name="lastName" id="lastName" placeholder="Apellidos (En caso de ser necesario)" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="number" name="balance" id="balance" placeholder="Saldo inicial" className='border p-3 rounded-lg' onChange={handleChange} />
          <p className="text-xs text-red-700">Ubicación</p>
          <input type="text" name="address" id="address" placeholder="Dirección del cliente" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="text" name="location" id="location" placeholder="https://maps.app.goo.gl/YU99bo6wYVY9AMdL6" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder="Teléfono de tu cliente" className='border p-3 rounded-lg' onChange={handleChange} />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}

      </div>


    </main>
  )
}