import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function RegistroProveedor() {

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


      const res = await fetch('api/provider/create',
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

      form.reset()

    } catch (error) {

      setLoading(false)
      setError(error.message)
    }
  }

  useEffect(() => {

    document.title = 'Registro Proveedor'
  })

  return (
    <main>

      <div className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          Registra un Nuevo Proveedor

        </h1>

        <form onSubmit={handleSubmit} id="form" className="flex flex-col gap-4">
          <input type="text" name="name" id="name" placeholder="Nombre del proveedor" className='border p-3 rounded-lg' onChange={handleChange} required/>
          <p className="text-xs text-red-700">Ubicación*</p>
          <input type="text" name="location" id="location" placeholder="https://maps.app.goo.gl/YU99bo6wYVY9AMdL6" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder="Teléfono del proveedor" className='border p-3 rounded-lg' required onChange={handleChange} />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}

      </div>


    </main>
  )
}
